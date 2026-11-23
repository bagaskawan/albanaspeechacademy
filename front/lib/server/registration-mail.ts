import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { readMailConfig } from "@/lib/mail-config";
import { createReceiptToken } from "@/lib/receipt-token";
import {
  type EmailKind,
  type InvoiceAmounts,
  type InvoiceStage,
  type PaymentMethod,
  invoiceStageLabel,
  paymentConfirmedEmail,
  paymentInstructionsEmail,
  paymentProofMessage,
  paymentRejectedEmail,
} from "@/lib/registration-email";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { sendMail } from "@/lib/server/mailer";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";

function normalizeWibIso(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) return trimmed;
  return `${trimmed}+07:00`;
}

function extractFirstSessionAt(
  items: { batch_slug: string; batches: { title?: string; sessions?: unknown } | { title?: string; sessions?: unknown }[] | null }[],
  primaryBatchSlug: string | null,
): string | null {
  const target =
    items.find((item) => item.batch_slug === primaryBatchSlug) ?? items[0];
  if (!target) return null;
  const batch = Array.isArray(target.batches) ? target.batches[0] : target.batches;
  const sessions = batch?.sessions;
  if (!Array.isArray(sessions) || sessions.length === 0) return null;
  const first = sessions[0];
  if (!first || typeof first !== "object") return null;
  return normalizeWibIso((first as Record<string, unknown>).starts_at);
}

async function claimDelivery(
  client: ReturnType<typeof academyBillingClient>,
  invoiceId: number,
  kind: EmailKind,
  retry: boolean,
): Promise<boolean> {
  const now = new Date().toISOString();
  if (!retry) {
    const { data, error } = await client
      .from("academy_email_deliveries")
      .upsert(
        { invoice_id: invoiceId, kind, status: "sending", attempts: 1, updated_at: now },
        { onConflict: "invoice_id,kind", ignoreDuplicates: true },
      )
      .select("id");
    if (error) throw error;
    return Array.isArray(data) && data.length > 0;
  }

  const { data: existing, error: readError } = await client
    .from("academy_email_deliveries")
    .select("id,status,attempts,updated_at")
    .eq("invoice_id", invoiceId)
    .eq("kind", kind)
    .maybeSingle();
  if (readError) throw readError;
  if (!existing) {
    const { data: inserted, error: insertError } = await client
      .from("academy_email_deliveries")
      .upsert(
        { invoice_id: invoiceId, kind, status: "sending", attempts: 1, updated_at: now },
        { onConflict: "invoice_id,kind", ignoreDuplicates: true },
      )
      .select("id");
    if (insertError) throw insertError;
    return Array.isArray(inserted) && inserted.length > 0;
  }

  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  const updatedMs = Date.parse(String(existing.updated_at));
  const isStaleSending =
    existing.status === "sending" && Number.isFinite(updatedMs) && updatedMs < tenMinutesAgo;
  if (existing.status !== "failed" && !isStaleSending) {
    return false;
  }
  if (existing.attempts >= 20) {
    return false;
  }

  const { data: updated, error: updateError } = await client
    .from("academy_email_deliveries")
    .update({ status: "sending", attempts: existing.attempts + 1, updated_at: now })
    .eq("id", existing.id)
    .eq("attempts", existing.attempts)
    .select("id");
  if (updateError) throw updateError;
  return Array.isArray(updated) && updated.length > 0;
}

async function markDeliveryFailed(
  client: ReturnType<typeof academyBillingClient>,
  invoiceId: number,
  kind: EmailKind,
  message: string,
): Promise<void> {
  try {
    await client
      .from("academy_email_deliveries")
      .update({
        status: "failed",
        last_error: message.slice(0, 300),
        updated_at: new Date().toISOString(),
      })
      .eq("invoice_id", invoiceId)
      .eq("kind", kind);
  } catch {
    // Do not throw from error-reporting path.
  }
}

export async function deliverInvoiceEmail(
  invoiceId: number,
  kind: EmailKind,
  options?: { retry?: boolean },
): Promise<"sent" | "skipped" | "failed" | "unconfigured"> {
  const retry = options?.retry ?? false;
  let claimed = false;

  try {
    const client = academyBillingClient();
    const config = readMailConfig(process.env);
    const secret = process.env.REGISTRATION_RECEIPT_SECRET?.trim() || "";

    if (!config || !secret) {
      const missing: string[] = [];
      if (!process.env.SMTP_USER?.trim()) missing.push("SMTP_USER");
      if (!process.env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
      if (!config && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim()) missing.push("SITE_URL");
      if (!secret) missing.push("REGISTRATION_RECEIPT_SECRET");
      const reason = `Pengirim email belum dikonfigurasi (${missing.join(", ") || "config"})`;
      console.warn("Email tagihan dilewati:", { invoiceId, kind, reason });
      claimed = await claimDelivery(client, invoiceId, kind, retry);
      if (!claimed) return "skipped";
      await markDeliveryFailed(client, invoiceId, kind, reason);
      return "unconfigured";
    }

    claimed = await claimDelivery(client, invoiceId, kind, retry);
    if (!claimed) return "skipped";

    const { data: invoice, error: invoiceError } = await client
      .from("academy_invoices")
      .select(
        "id,invoice_number,registration_id,stage,subtotal_idr,unique_code,total_idr,status,bank_accounts(bank,account_number,holder)",
      )
      .eq("id", invoiceId)
      .single();
    if (invoiceError || !invoice) {
      await markDeliveryFailed(client, invoiceId, kind, "Tagihan tidak ditemukan");
      return "failed";
    }

    if (kind === "payment_instructions" && invoice.status !== "pending") {
      await markDeliveryFailed(client, invoiceId, kind, "Tagihan sudah tidak pending");
      return "skipped";
    }
    if (kind === "payment_confirmed" && invoice.status !== "verified") {
      await markDeliveryFailed(client, invoiceId, kind, "Tagihan belum terverifikasi");
      return "skipped";
    }
    if (kind === "payment_rejected" && invoice.status !== "rejected") {
      await markDeliveryFailed(client, invoiceId, kind, "Tagihan tidak berstatus ditolak");
      return "skipped";
    }

    const bank = Array.isArray(invoice.bank_accounts)
      ? invoice.bank_accounts[0]
      : invoice.bank_accounts;
    if (!bank) {
      await markDeliveryFailed(client, invoiceId, kind, "Rekening tujuan tidak ditemukan");
      return "failed";
    }

    const { data: registration, error: regError } = await client
      .from("academy_registrations")
      .select("id,full_name,email,offer_title,payment_method,primary_batch_slug")
      .eq("id", invoice.registration_id)
      .single();
    if (regError || !registration) {
      await markDeliveryFailed(client, invoiceId, kind, "Data pendaftaran tidak ditemukan");
      return "failed";
    }

    const { data: items, error: itemsError } = await client
      .from("academy_registration_items")
      .select("batch_slug,batches(title,sessions)")
      .eq("registration_id", registration.id)
      .order("batch_slug");
    if (itemsError || !items?.length) {
      await markDeliveryFailed(client, invoiceId, kind, "Data batch pendaftaran tidak ditemukan");
      return "failed";
    }

    const batchNames = items
      .map((item) => {
        const b = Array.isArray(item.batches) ? item.batches[0] : item.batches;
        return b?.title ?? item.batch_slug;
      })
      .join(" + ");
    const firstSessionAt = extractFirstSessionAt(items, registration.primary_batch_slug);

    const stage = invoice.stage as InvoiceStage;
    const paymentMethod = registration.payment_method as PaymentMethod;
    const amounts: InvoiceAmounts = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      subtotalIdr: Number(invoice.subtotal_idr),
      uniqueCode: Number(invoice.unique_code),
      totalIdr: Number(invoice.total_idr),
    };

    let remaining: InvoiceAmounts | null = null;
    if (kind === "payment_confirmed" && stage === "initial" && paymentMethod === "dp") {
      const { data: remRow } = await client
        .from("academy_invoices")
        .select("id,invoice_number,subtotal_idr,unique_code,total_idr")
        .eq("registration_id", registration.id)
        .eq("stage", "remaining")
        .eq("status", "pending")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (remRow) {
        remaining = {
          invoiceId: remRow.id,
          invoiceNumber: remRow.invoice_number,
          subtotalIdr: Number(remRow.subtotal_idr),
          uniqueCode: Number(remRow.unique_code),
          totalIdr: Number(remRow.total_idr),
        };
      }
    }

    const receiptUrl = `${config.siteUrl}/register/konfirmasi/${createReceiptToken(
      registration.id,
      secret,
    )}`;

    let whatsappUrl: string | null = null;
    try {
      const waContact = (await readPublishedContacts()).find((c) => c.kind === "whatsapp");
      const baseWa = waContact ? contactHref(waContact) : undefined;
      if (baseWa) {
        const useProofMessage =
          kind === "payment_instructions" ||
          (kind === "payment_confirmed" && stage === "initial" && paymentMethod === "dp");
        const waText = useProofMessage
          ? paymentProofMessage({
              registrationId: registration.id,
              invoiceId: amounts.invoiceId,
              invoiceNumber: amounts.invoiceNumber,
              fullName: registration.full_name,
              offerTitle: registration.offer_title,
              batchNames,
              stageLabel: invoiceStageLabel(stage, paymentMethod),
              totalIdr: amounts.totalIdr,
            })
          : kind === "payment_rejected"
            ? `Halo Admin Albana, saya ${registration.full_name} (tagihan ${amounts.invoiceNumber}) ingin menanyakan penolakan tagihan.`
            : `Halo Admin Albana, saya ${registration.full_name} peserta ${registration.offer_title}${batchNames ? ` – ${batchNames}` : ""}.`;
        whatsappUrl = `${baseWa}?text=${encodeURIComponent(waText)}`;
      }
    } catch {
      whatsappUrl = null;
    }

    const emailLogoPath = path.join(process.cwd(), "public", "logo-email.png");
    const fallbackLogoPath = path.join(process.cwd(), "public", "logo-blue.png");
    const logoPath = existsSync(emailLogoPath) ? emailLogoPath : fallbackLogoPath;
    const hasLogo = existsSync(logoPath);

    const emailData = {
      registrationId: registration.id,
      fullName: registration.full_name,
      offerTitle: registration.offer_title,
      batchNames,
      paymentMethod,
      stage,
      invoice: amounts,
      bank: {
        bank: bank.bank,
        accountNumber: bank.account_number,
        holder: bank.holder,
      },
      receiptUrl,
      whatsappUrl,
      firstSessionAt,
      remaining,
      logoUrl: hasLogo ? "cid:albana-logo" : null,
    };

    const rendered =
      kind === "payment_instructions"
        ? paymentInstructionsEmail(emailData)
        : kind === "payment_rejected"
          ? paymentRejectedEmail(emailData)
          : paymentConfirmedEmail(emailData);

    const sent = await sendMail(config, {
      to: registration.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      attachments: hasLogo
        ? [
            {
              filename: "albana-logo.png",
              path: logoPath,
              cid: "albana-logo",
              contentDisposition: "inline",
            },
          ]
        : undefined,
    });

    await client
      .from("academy_email_deliveries")
      .update({
        status: "sent",
        message_id: sent.messageId || null,
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("invoice_id", invoiceId)
      .eq("kind", kind);

    return "sent";
  } catch (error) {
    const shortMessage = String(error instanceof Error ? error.message : error).slice(0, 300);
    console.error("Email tagihan gagal", { invoiceId, kind, error: shortMessage });
    if (claimed) {
      try {
        await markDeliveryFailed(academyBillingClient(), invoiceId, kind, shortMessage);
      } catch {
        // Ignore secondary failure.
      }
    }
    return "failed";
  }
}
