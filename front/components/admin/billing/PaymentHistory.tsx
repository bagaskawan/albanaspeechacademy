"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { StatusChip } from "@/components/admin/ui/data-table";
import { paymentBalance } from "@/lib/billing";
import type { InvoicePaymentItem } from "@/lib/billing-rows";
import { voidInvoicePayment } from "@/app/(admin)/admin/tagihan/actions";
import { RecordPaymentDialog } from "./RecordPaymentDialog";

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

export function PaymentHistory({
  invoiceId,
  invoiceNumber,
  totalIdr,
  invoiceStatus,
  payments,
  recordLabel = "Catat transfer",
}: {
  invoiceId: number;
  invoiceNumber: string;
  totalIdr: number;
  invoiceStatus: string;
  payments: readonly InvoicePaymentItem[];
  recordLabel?: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeAmounts = payments.filter((p) => !p.voided).map((p) => p.amountIdr);
  const summary = paymentBalance(totalIdr, activeAmounts);
  const isPending = invoiceStatus === "pending";

  return (
    <div className="mt-3 space-y-2.5">
      {payments.length > 0 && (
        <div className="rounded-xl border border-admin-line bg-admin-surface p-3 text-[12px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-admin-text-secondary">
              Total {rupiah(totalIdr)} · Sudah masuk{" "}
              <strong className="font-mono text-admin-ink">{rupiah(summary.paidIdr)}</strong> · Sisa{" "}
              <strong className="font-mono text-admin-ink">{rupiah(Math.max(0, summary.balanceIdr))}</strong>
            </span>
            {summary.state === "short" && (
              <StatusChip tone="rose">Kurang {rupiah(summary.balanceIdr)}</StatusChip>
            )}
            {summary.state === "exact" && <StatusChip tone="mint">Pas</StatusChip>}
            {summary.state === "over" && (
              <StatusChip tone="peach">Lebih {rupiah(-summary.balanceIdr)}</StatusChip>
            )}
          </div>

          <ul className="mt-2.5 divide-y divide-admin-line border-t border-admin-line">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className={`py-2 ${payment.voided ? "text-admin-text-secondary line-through opacity-75" : ""}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-admin-ink">
                    {rupiah(payment.amountIdr)}
                  </span>
                  <span className="font-mono text-[11px] text-admin-text-secondary">
                    {formatWib(payment.recordedAt)} WIB
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-admin-text-secondary">
                  <span>
                    Sisa setelahnya: {rupiah(payment.balanceAfterIdr)}
                    {payment.note ? ` · ${payment.note}` : ""}
                    {payment.voided ? " · Dibatalkan" : ""}
                  </span>
                  <span className="inline-flex items-center gap-2 no-underline">
                    <a
                      href={`/api/admin/invoice-payments/${payment.id}/proof`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-admin-ink underline-offset-2 hover:underline"
                    >
                      Lihat bukti
                    </a>
                    {isPending && !payment.voided && (
                      <form
                        action={voidInvoicePayment}
                        onSubmit={(e) => {
                          if (!window.confirm("Batalkan catatan transfer ini? Bukti tetap tersimpan.")) {
                            e.preventDefault();
                          }
                        }}
                        className="inline"
                      >
                        <input type="hidden" name="paymentId" value={payment.id} />
                        <button
                          type="submit"
                          className="font-medium text-admin-danger underline-offset-2 hover:underline"
                        >
                          Batalkan
                        </button>
                      </form>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isPending && (
        <>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1 text-[13px] text-admin-text-secondary underline-offset-2 hover:text-admin-ink hover:underline"
          >
            <Plus size={14} aria-hidden="true" />
            {recordLabel}
          </button>
          <RecordPaymentDialog
            invoiceId={invoiceId}
            invoiceNumber={invoiceNumber}
            totalIdr={totalIdr}
            recordedIdr={activeAmounts}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={recordLabel}
          />
        </>
      )}
    </div>
  );
}
