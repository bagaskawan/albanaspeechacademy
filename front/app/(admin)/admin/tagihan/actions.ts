"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { parseRupiahInput } from "@/lib/billing";
import type { EmailKind } from "@/lib/registration-email";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { logAdminActivity } from "@/lib/server/admin-activity";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { deliverInvoiceEmail } from "@/lib/server/registration-mail";

export async function resolveInvoice(form: FormData): Promise<void> {
  const admin = await requireAdminMember();
  const { data: { user } } = await admin.auth.getUser();
  if (!user) throw new Error("Sesi admin berakhir.");

  const id = Number(form.get("invoiceId"));
  const decision = String(form.get("decision") ?? "");
  if (!Number.isSafeInteger(id) || id < 1 || (decision !== "verified" && decision !== "rejected")) {
    throw new Error("Keputusan tagihan tidak valid.");
  }

  let receivedIdr: number | null = null;
  if (decision === "verified") {
    receivedIdr = parseRupiahInput(String(form.get("receivedIdr") ?? ""));
    if (receivedIdr === null) {
      throw new Error("Isi nominal yang diterima sesuai mutasi rekening.");
    }
  }

  const { data, error } = await academyBillingClient().rpc("resolve_academy_invoice", {
    target_invoice_id: id,
    decision,
    reviewer: user.id,
    received_idr: receivedIdr,
  });

  if (data?.status === "amount_mismatch") {
    throw new Error(
      "Nominal diterima tidak sama dengan total tagihan. Cek mutasi rekening, bukan tangkapan layar dari peserta. Selesaikan selisih dengan peserta lewat WhatsApp; tagihan tetap menunggu pembayaran.",
    );
  }
  if (error || data?.status !== "resolved") {
    throw new Error("Tagihan sudah berubah atau verifikasi gagal.");
  }

  await logAdminActivity({
    actor: admin.adminUser,
    action: decision === "verified" ? "verify" : "reject",
    module: "tagihan",
    entityId: id,
    entityLabel: `Tagihan #${id}`,
    summary:
      decision === "verified"
        ? `Memverifikasi pembayaran tagihan #${id}${receivedIdr !== null ? ` sebesar Rp ${receivedIdr.toLocaleString("id-ID")}` : ""}`
        : `Menolak pembayaran tagihan #${id}`,
    metadata: { decision, receivedIdr },
  });

  if (decision === "verified") {
    after(() => deliverInvoiceEmail(id, "payment_confirmed"));
  } else if (decision === "rejected") {
    after(() => deliverInvoiceEmail(id, "payment_rejected"));
  }

  revalidatePath("/admin/tagihan");
}

export async function resendInvoiceEmail(form: FormData): Promise<void> {
  await requireAdminMember();

  const id = Number(form.get("invoiceId"));
  const rawKind = String(form.get("kind") ?? "");
  if (
    !Number.isSafeInteger(id) ||
    id < 1 ||
    (rawKind !== "payment_instructions" &&
      rawKind !== "payment_confirmed" &&
      rawKind !== "payment_rejected")
  ) {
    throw new Error("Permintaan kirim ulang email tidak valid.");
  }

  const kind: EmailKind = rawKind;
  const result = await deliverInvoiceEmail(id, kind, { retry: true });
  revalidatePath("/admin/tagihan");
  revalidatePath("/admin/cicilan");

  if (result === "unconfigured") {
    throw new Error("Pengirim email belum dikonfigurasi.");
  }
}

export async function voidInvoicePayment(form: FormData): Promise<void> {
  const admin = await requireAdminMember();
  const { data: { user } } = await admin.auth.getUser();
  if (!user) throw new Error("Sesi admin berakhir.");

  const paymentId = Number(form.get("paymentId"));
  if (!Number.isSafeInteger(paymentId) || paymentId < 1) {
    throw new Error("Catatan transfer tidak valid.");
  }

  const { data, error } = await academyBillingClient().rpc("void_invoice_payment", {
    target_payment_id: paymentId,
    reviewer: user.id,
  });

  if (error || data?.status !== "voided") {
    throw new Error("Catatan sudah dibatalkan atau tagihan sudah diproses.");
  }

  await logAdminActivity({
    actor: admin.adminUser,
    action: "delete",
    module: "tagihan",
    entityId: paymentId,
    entityLabel: `Pembayaran #${paymentId}`,
    summary: `Membatalkan catatan transfer pembayaran #${paymentId}`,
  });

  revalidatePath("/admin/tagihan");
}

export async function deleteBillingItem(form: FormData): Promise<void> {
  const admin = await requireAdminMember();

  const rawInvoiceId = form.get("invoiceId");
  const rawRegistrationId = form.get("registrationId");
  const client = academyBillingClient();

  if (rawInvoiceId) {
    const invoiceId = Number(rawInvoiceId);
    if (!Number.isSafeInteger(invoiceId) || invoiceId < 1) {
      throw new Error("ID tagihan tidak valid.");
    }
    const { data: targetInv } = await client
      .from("academy_invoices")
      .select("registration_id, invoice_number")
      .eq("id", invoiceId)
      .maybeSingle();

    const { error } = await client.from("academy_invoices").delete().eq("id", invoiceId);
    if (error) throw new Error("Gagal menghapus tagihan.");

    if (targetInv?.registration_id) {
      const { count } = await client
        .from("academy_invoices")
        .select("id", { count: "exact", head: true })
        .eq("registration_id", targetInv.registration_id);
      if (count === 0) {
        await client.from("academy_registrations").delete().eq("id", targetInv.registration_id);
      }
    }

    const label = targetInv?.invoice_number || `Tagihan #${invoiceId}`;
    await logAdminActivity({
      actor: admin.adminUser,
      action: "delete",
      module: "tagihan",
      entityId: invoiceId,
      entityLabel: label,
      summary: `Menghapus tagihan "${label}"`,
    });
  } else if (rawRegistrationId) {
    const registrationId = Number(rawRegistrationId);
    if (!Number.isSafeInteger(registrationId) || registrationId < 1) {
      throw new Error("ID pendaftaran tidak valid.");
    }
    const { error } = await client.from("academy_registrations").delete().eq("id", registrationId);
    if (error) throw new Error("Gagal menghapus pendaftaran.");

    await logAdminActivity({
      actor: admin.adminUser,
      action: "delete",
      module: "tagihan",
      entityId: registrationId,
      entityLabel: `Pendaftaran #${registrationId}`,
      summary: `Menghapus data pendaftaran #${registrationId} dari daftar tagihan`,
    });
  } else {
    throw new Error("Data yang akan dihapus tidak valid.");
  }

  revalidatePath("/admin/tagihan");
}
