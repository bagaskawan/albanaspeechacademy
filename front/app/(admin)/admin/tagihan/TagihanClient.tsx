"use client";

import { useState } from "react";
import { Eye, MessageCircle, Receipt, Trash2 } from "lucide-react";
import { InvoiceCard, whatsappParticipantHref } from "@/components/admin/billing/InvoiceCard";
import { AdminSheet } from "@/components/admin/ui/AdminSheet";
import {
  DataTable,
  StatusChip,
  rowActionClass,
  rowDangerActionClass,
} from "@/components/admin/ui/data-table";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { TableToolbar } from "@/components/admin/ui/table-toolbar";
import { paymentBalance } from "@/lib/billing";
import type { BillingRegistration, BillingRow, InvoiceEmailStatus } from "@/lib/billing-rows";
import { deleteBillingItem, resendInvoiceEmail, resolveInvoice } from "./actions";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

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

function sortedBatchNames(items: readonly { batch_slug: string }[]): string {
  return [...items]
    .map((item) => item.batch_slug)
    .sort((a, b) => a.localeCompare(b))
    .join(" + ");
}

function EmailBadges({ invoiceId, emails }: { invoiceId: number; emails: readonly InvoiceEmailStatus[] }) {
  if (!emails.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
      {emails.map((email) => {
        const kindLabel =
          email.kind === "payment_instructions"
            ? "Email instruksi"
            : email.kind === "payment_rejected"
              ? "Email penolakan"
              : "Email konfirmasi";
        const statusLabel =
          email.status === "sent" ? "terkirim" : email.status === "sending" ? "mengirim" : "gagal";
        return (
          <span key={email.kind} className="inline-flex items-center gap-1.5">
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
                <input type="hidden" name="invoiceId" value={invoiceId} />
                <input type="hidden" name="kind" value={email.kind} />
                <button
                  type="submit"
                  className="inline-flex h-6 items-center rounded-full border border-admin-line px-2 text-[11px] font-medium text-admin-ink hover:bg-admin-surface"
                >
                  Kirim ulang
                </button>
              </form>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function TagihanClient({
  rows,
  searching,
}: {
  rows: BillingRow[];
  searching: boolean;
}) {
  const [selected, setSelected] = useState<BillingRegistration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BillingRow | null>(null);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <TableToolbar
        search={{ placeholder: "Cari nama atau email…" }}
        exportModule="tagihan"
        exportDisabled={rows.length === 0}
      />

      {rows.length === 0 ? (
        searching ? (
          <EmptyState searching title="Tidak ada tagihan yang cocok" description="Coba nama atau email lain." />
        ) : (
          <EmptyState title="Belum ada tagihan" description="Tagihan terbentuk otomatis saat peserta mendaftar." />
        )
      ) : (
        <>
          {/* Mobile clean white cards */}
          <div className="space-y-3.5 md:hidden">
            {rows.map((row) => {
              const info = statusInfo(row.status);
              const batches = sortedBatchNames(row.registration.academy_registration_items);
              const activeAmounts = row.payments.filter((p) => !p.voided).map((p) => p.amountIdr);
              const balance = row.totalIdr !== null ? paymentBalance(row.totalIdr, activeAmounts) : null;
              return (
                <article
                  key={`m-${row.invoiceId ? `inv-${row.invoiceId}` : `reg-${row.registration.id}`}`}
                  className="rounded-[24px] border border-admin-line bg-admin-canvas p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex h-7 items-center rounded-full bg-admin-surface px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-admin-text-secondary">
                      {row.stageLabel}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusChip tone={info.tone}>{info.label}</StatusChip>
                      {row.status === "pending" && balance?.state === "short" && (
                        <StatusChip tone="rose">Kurang {rupiah(balance.balanceIdr)}</StatusChip>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="font-mono text-[22px] font-bold leading-tight tracking-[-0.02em] tabular-nums text-admin-ink">
                      {row.totalIdr !== null ? rupiah(row.totalIdr) : "—"}
                    </p>
                    <p className="mt-1 truncate text-[14px] font-semibold text-admin-ink">
                      {row.registration.full_name}
                    </p>
                    <p className="mt-0.5 text-[12px] font-medium text-admin-ink">
                      {row.registration.offer_title}
                    </p>
                    {batches && (
                      <p className="text-[12px] text-admin-text-secondary">{batches}</p>
                    )}
                    {row.invoiceId !== null && (
                      <EmailBadges invoiceId={row.invoiceId} emails={row.emails} />
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-admin-line pt-3.5">
                    <p className="font-mono text-[11px] text-admin-text-secondary">
                      Dibuat: {formatWib(row.createdAt)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {row.invoiceId !== null && row.status === "pending" && row.totalIdr !== null && (
                        <form action={resolveInvoice} className="inline-flex">
                          <input type="hidden" name="invoiceId" value={row.invoiceId} />
                          <input type="hidden" name="decision" value="verified" />
                          <input type="hidden" name="receivedIdr" value={row.totalIdr} />
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center rounded-full bg-admin-ink px-3.5 text-[13px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft"
                          >
                            Konfirmasi
                          </button>
                        </form>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelected(row.registration)}
                        aria-label={`Detail tagihan ${row.registration.full_name}`}
                        title="Detail"
                        className={rowActionClass}
                      >
                        <Eye aria-hidden="true" size={18} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        aria-label={`Hapus tagihan ${row.registration.full_name}`}
                        title="Hapus"
                        className={rowDangerActionClass}
                      >
                        <Trash2 aria-hidden="true" size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <DataTable caption="Tagihan">
              <thead>
                <tr>
                  <th scope="col">Nama</th>
                  <th scope="col">Program – batch</th>
                  <th scope="col" data-numeric="">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col">Dibuat (WIB)</th>
                  <th scope="col" className="text-right"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const info = statusInfo(row.status);
                  const batches = sortedBatchNames(row.registration.academy_registration_items);
                  const activeAmounts = row.payments.filter((p) => !p.voided).map((p) => p.amountIdr);
                  const balance = row.totalIdr !== null ? paymentBalance(row.totalIdr, activeAmounts) : null;
                  return (
                    <tr key={row.invoiceId ? `inv-${row.invoiceId}` : `reg-${row.registration.id}`}>
                      <td className="whitespace-nowrap font-medium text-admin-ink">
                        {row.registration.full_name}
                      </td>
                      <td className="min-w-[14rem]">
                        <div className="font-medium text-admin-ink">{row.registration.offer_title}</div>
                        {batches && (
                          <div className="text-[12px] text-admin-text-secondary">{batches}</div>
                        )}
                      </td>
                      <td data-numeric="" className="whitespace-nowrap font-mono tabular-nums">
                        {row.totalIdr !== null ? rupiah(row.totalIdr) : "—"}
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusChip tone={info.tone}>{info.label}</StatusChip>
                          {row.status === "pending" && balance?.state === "short" && (
                            <StatusChip tone="rose">Kurang {rupiah(balance.balanceIdr)}</StatusChip>
                          )}
                        </div>
                        {row.invoiceId !== null && (
                          <EmailBadges invoiceId={row.invoiceId} emails={row.emails} />
                        )}
                      </td>
                      <td className="whitespace-nowrap text-admin-text-secondary">
                        {formatWib(row.createdAt)}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {row.invoiceId !== null && row.status === "pending" && row.totalIdr !== null && (
                            <form action={resolveInvoice} className="inline-flex">
                              <input type="hidden" name="invoiceId" value={row.invoiceId} />
                              <input type="hidden" name="decision" value="verified" />
                              <input type="hidden" name="receivedIdr" value={row.totalIdr} />
                              <button
                                type="submit"
                                className="inline-flex h-9 items-center rounded-full bg-admin-ink px-3.5 text-[13px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft"
                              >
                                Konfirmasi
                              </button>
                            </form>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelected(row.registration)}
                            aria-label={`Detail tagihan ${row.registration.full_name}`}
                            title="Detail"
                            className={rowActionClass}
                          >
                            <Eye aria-hidden="true" size={18} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            aria-label={`Hapus tagihan ${row.registration.full_name}`}
                            title="Hapus"
                            className={rowDangerActionClass}
                          >
                            <Trash2 aria-hidden="true" size={18} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          </div>
        </>
      )}

      <AdminSheet
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        size="md"
        icon={<Receipt aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={selected ? `#${selected.id} · ${selected.full_name}` : "Detail tagihan"}
        description={selected ? `Masuk ${formatWib(selected.received_at)} WIB` : undefined}
        footer={
          selected && (() => {
            const pendingInvoice = selected.academy_invoices.find((inv) => inv.status === "pending");
            const waHref = whatsappParticipantHref(selected.whatsapp);
            return (
              <div className="flex w-full flex-col gap-2.5">
                {(waHref || pendingInvoice) && (
                  <div className="flex w-full items-center gap-2.5">
                    {waHref && (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#25D366] text-[14px] font-medium text-white transition-colors hover:bg-[#1ebe57]"
                      >
                        <MessageCircle size={16} aria-hidden="true" />
                        Chat peserta
                      </a>
                    )}
                    {pendingInvoice && (
                      <form
                        action={async (formData) => {
                          await resolveInvoice(formData);
                          setSelected(null);
                        }}
                        className="flex-1"
                      >
                        <input type="hidden" name="invoiceId" value={pendingInvoice.id} />
                        <input type="hidden" name="decision" value="verified" />
                        <input type="hidden" name="receivedIdr" value={Number(pendingInvoice.total_idr)} />
                        <button
                          type="submit"
                          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-admin-ink text-[14px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft"
                        >
                          Konfirmasi
                        </button>
                      </form>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
                >
                  Tutup
                </button>
              </div>
            );
          })()
        }
      >
        {selected && (
          <div className="space-y-5">
            <dl className="grid gap-3 rounded-[20px] border border-admin-line bg-admin-surface p-4 text-[14px]">
              <div>
                <dt className="text-[12px] text-admin-text-secondary">Email</dt>
                <dd className="font-medium text-admin-ink">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-admin-text-secondary">WhatsApp</dt>
                <dd className="font-mono font-medium text-admin-ink">{selected.whatsapp}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-admin-text-secondary">Program &amp; batch</dt>
                <dd className="font-medium text-admin-ink">
                  {selected.offer_title}
                  {selected.academy_registration_items.length > 0 && (
                    <span className="block text-[13px] font-normal text-admin-text-secondary">
                      {sortedBatchNames(selected.academy_registration_items)}
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-admin-ink">Daftar tagihan</h3>
              {selected.academy_invoices.length === 0 ? (
                <p className="rounded-[20px] border border-admin-line p-4 text-[13px] text-admin-text-secondary">
                  Belum ada tagihan untuk pendaftaran ini.
                </p>
              ) : (
                [...selected.academy_invoices]
                  .sort((a, b) => a.id - b.id)
                  .map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      registration={selected}
                      context="tagihan"
                    />
                  ))
              )}
            </div>
          </div>
        )}
      </AdminSheet>

      <AdminSheet
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        size="sm"
        tone="danger"
        icon={<Trash2 aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={
          deleteTarget?.invoiceId
            ? `Hapus Tagihan #${deleteTarget.invoiceId}?`
            : `Hapus pendaftaran ${deleteTarget?.registration.full_name ?? ""}?`
        }
        description="Tindakan ini tidak dapat dibatalkan."
        footer={
          deleteTarget && (
            <>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface sm:w-auto sm:flex-1"
              >
                Batal
              </button>
              <form
                action={async (formData) => {
                  await deleteBillingItem(formData);
                  setDeleteTarget(null);
                }}
                className="w-full sm:w-auto sm:flex-1"
              >
                {deleteTarget.invoiceId ? (
                  <input type="hidden" name="invoiceId" value={deleteTarget.invoiceId} />
                ) : (
                  <input type="hidden" name="registrationId" value={deleteTarget.registration.id} />
                )}
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-admin-danger text-[15px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Hapus
                </button>
              </form>
            </>
          )
        }
      />
    </div>
  );
}
