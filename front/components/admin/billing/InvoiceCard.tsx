"use client";

import { StatusChip } from "@/components/admin/ui/data-table";
import { paymentBalance } from "@/lib/billing";
import {
  mapInvoicePayments,
  type BillingInvoice,
  type BillingRegistration,
} from "@/lib/billing-rows";
import { resendInvoiceEmail } from "@/app/(admin)/admin/tagihan/actions";
import { PaymentHistory } from "./PaymentHistory";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatWib = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));

const STATUS_MAP = {
  verified: { tone: "mint", label: "Terverifikasi" },
  pending: { tone: "peach", label: "Menunggu" },
  rejected: { tone: "rose", label: "Ditolak" },
} as const;

function statusInfo(status: string) {
  if (status in STATUS_MAP) return STATUS_MAP[status as keyof typeof STATUS_MAP];
  return { tone: "neutral" as const, label: status };
}

export function whatsappParticipantHref(whatsapp: string): string | null {
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

export function InvoiceCard({
  invoice,
  registration,
  context = "tagihan",
}: {
  invoice: BillingInvoice;
  registration: BillingRegistration;
  context?: "tagihan" | "cicilan";
}) {
  const info = statusInfo(invoice.status);
  const subtotal = Number(invoice.subtotal_idr);
  const total = Number(invoice.total_idr);
  const payments = mapInvoicePayments(invoice);
  const activeAmounts = payments.filter((p) => !p.voided).map((p) => p.amountIdr);
  const balance = paymentBalance(total, activeAmounts);
  const emails = invoice.academy_email_deliveries ?? [];

  const recordLabel =
    invoice.stage === "remaining"
      ? "Catat cicilan / pelunasan"
      : registration.payment_method === "dp"
        ? "Catat DP"
        : "Catat transfer";

  return (
    <div
      data-context={context}
      className="space-y-4 rounded-[20px] border border-admin-line bg-admin-canvas p-4 text-[14px]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-admin-ink">Tagihan #{invoice.id}</p>
          <span className="inline-flex h-6 items-center rounded-full bg-admin-surface px-2.5 text-[11px] font-medium text-admin-text-secondary">
            {invoice.stage === "remaining" ? "Pelunasan" : "Awal"}
          </span>
        </div>
        <StatusChip tone={info.tone}>{info.label}</StatusChip>
      </div>

      <dl className="space-y-1.5 rounded-2xl border border-admin-line bg-admin-surface p-3.5 text-[13px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-admin-text-secondary">Subtotal</dt>
          <dd className="font-mono tabular-nums text-admin-ink">{rupiah(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-admin-text-secondary">Kode unik</dt>
          <dd className="font-mono tabular-nums text-admin-ink">
            +{String(invoice.unique_code).padStart(3, "0")}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-admin-line pt-2 text-[14px] font-semibold">
          <dt className="text-admin-ink">Total transfer</dt>
          <dd className="font-mono tabular-nums text-admin-ink">{rupiah(total)}</dd>
        </div>
      </dl>

      {emails.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          {emails.map((email) => {
            const kindLabel =
              email.kind === "payment_instructions"
                ? "Email instruksi"
                : email.kind === "payment_rejected"
                  ? "Email penolakan"
                  : "Email konfirmasi";
            const statusLabel =
              email.status === "sent"
                ? "terkirim"
                : email.status === "sending"
                  ? "mengirim"
                  : "gagal";
            return (
              <span
                key={email.kind}
                className="inline-flex items-center gap-1.5 rounded-full border border-admin-line bg-admin-surface px-2.5 py-1"
              >
                <span
                  className={
                    email.status === "failed"
                      ? "font-medium text-admin-danger"
                      : "text-admin-text-secondary"
                  }
                >
                  {kindLabel}: {statusLabel}
                </span>
                {email.status === "failed" && (
                  <form action={resendInvoiceEmail} className="inline">
                    <input type="hidden" name="invoiceId" value={invoice.id} />
                    <input type="hidden" name="kind" value={email.kind} />
                    <button
                      type="submit"
                      className="font-medium text-admin-ink underline underline-offset-2 hover:opacity-80"
                    >
                      Kirim ulang
                    </button>
                  </form>
                )}
              </span>
            );
          })}
        </div>
      )}

      <PaymentHistory
        invoiceId={invoice.id}
        totalIdr={total}
        invoiceStatus={invoice.status}
        payments={payments}
        recordLabel={recordLabel}
      />

      {invoice.status === "pending" && balance.state === "short" && (
        <p className="rounded-xl bg-admin-rose-soft px-3 py-2 text-[12px] font-medium text-admin-danger">
          Tercatat {rupiah(balance.paidIdr)} dari {rupiah(total)}. Masih kurang{" "}
          {rupiah(balance.balanceIdr)}.
        </p>
      )}

      {invoice.status === "verified" && invoice.received_idr != null && (
        <p className="text-[12px] text-admin-text-secondary">
          Diterima di mutasi:{" "}
          <strong className="font-mono text-admin-ink">
            {rupiah(Number(invoice.received_idr))}
          </strong>
        </p>
      )}

      {invoice.reviewed_at && (
        <p className="text-[12px] text-admin-text-secondary">
          Diperiksa {formatWib(invoice.reviewed_at)} WIB
        </p>
      )}
    </div>
  );
}
