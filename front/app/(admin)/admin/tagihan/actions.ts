"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";

export async function resolveInvoice(form: FormData) {
  const admin = await requireAdminMember();
  const { data: { user } } = await admin.auth.getUser();
  if (!user) throw new Error("Sesi admin berakhir.");
  const id = Number(form.get("invoiceId"));
  const decision = form.get("decision");
  if (!Number.isSafeInteger(id) || id < 1 || !["verified", "rejected"].includes(String(decision))) {
    throw new Error("Keputusan tagihan tidak valid.");
  }
  const { data, error } = await academyBillingClient().rpc("resolve_academy_invoice", {
    target_invoice_id: id, decision, reviewer: user.id,
  });
  if (error || data?.status !== "resolved") throw new Error("Tagihan sudah berubah atau verifikasi gagal.");
  revalidatePath("/admin/tagihan");
}
