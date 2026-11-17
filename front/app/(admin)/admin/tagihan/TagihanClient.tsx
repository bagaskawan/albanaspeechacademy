"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { DataTable, StatusChip } from "@/components/admin/ui/data-table";
import { rowPillClass } from "@/components/admin/ui/row-actions";
import { AdminSheet } from "@/components/admin/ui/AdminSheet";
import { TableToolbar } from "@/components/admin/ui/table-toolbar";
import { EmptyState } from "@/components/admin/ui/empty-state";
import type { BillingRegistration, BillingRow } from "@/lib/billing-rows";
import { resolveInvoice } from "./actions";

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

export default function TagihanClient({
  rows,
  searching,
}: {
  rows: BillingRow[];
  searching: boolean;
}) {
  const [selected, setSelected] = useState<BillingRegistration | null>(null);

  return (
    <div className="space-y-6">
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
        <DataTable caption="Tagihan" stackOnMobile>
          <thead>
            <tr>
              <th scope="col">Dibuat (WIB)</th>
              <th scope="col">Nama</th>
              <th scope="col">Program – batch</th>
              <th scope="col">Tahap</th>
              <th scope="col" data-numeric="">Total</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const info = statusInfo(row.status);
              const batches = row.registration.academy_registration_items.map((item) => item.batch_slug).join(" + ");
              const programBatch = batches ? `${row.registration.offer_title} – ${batches}` : row.registration.offer_title;
              return (
                <tr key={row.invoiceId ? `inv-${row.invoiceId}` : `reg-${row.registration.id}`}>
                  <td data-label="Dibuat (WIB)" className="whitespace-nowrap text-admin-text-secondary">
                    {formatWib(row.createdAt)}
                  </td>
                  <td data-label="Nama" className="font-medium">
                    {row.registration.full_name}
                  </td>
                  <td data-label="Program – batch" className="text-admin-text-secondary">
                    {programBatch}
                  </td>
                  <td data-label="Tahap">{row.stageLabel}</td>
                  <td data-label="Total" data-numeric="" className="whitespace-nowrap font-mono tabular-nums">
                    {row.totalIdr !== null ? rupiah(row.totalIdr) : "—"}
                  </td>
                  <td data-label="Status">
                    <StatusChip tone={info.tone}>{info.label}</StatusChip>
                  </td>
                  <td data-label="Aksi" className="text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setSelected(row.registration)}
                        className={rowPillClass}
                      >
                        Detail
                      </button>
                      {row.invoiceId !== null && row.status === "pending" && (
                        <>
                          <form action={resolveInvoice}>
                            <input type="hidden" name="invoiceId" value={row.invoiceId} />
                            <input type="hidden" name="decision" value="verified" />
                            <button
                              type="submit"
                              className="inline-flex h-9 items-center rounded-full bg-admin-ink px-3.5 text-[13px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
                            >
                              Verifikasi
                            </button>
                          </form>
                          <form action={resolveInvoice}>
                            <input type="hidden" name="invoiceId" value={row.invoiceId} />
                            <input type="hidden" name="decision" value="rejected" />
                            <button
                              type="submit"
                              className="inline-flex h-9 items-center rounded-full px-3 text-[13px] font-medium text-admin-danger transition-colors hover:bg-admin-rose-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
                            >
                              Tolak
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      )}

      <AdminSheet
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        size="md"
        icon={<Receipt aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={selected ? `#${selected.id} · ${selected.full_name}` : "Detail tagihan"}
        description={selected ? `Masuk ${formatWib(selected.received_at)} WIB` : undefined}
        footer={
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
          >
            Tutup
          </button>
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
                      {selected.academy_registration_items.map((item) => item.batch_slug).join(" + ")}
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
                  .map((invoice) => {
                    const info = statusInfo(invoice.status);
                    return (
                      <div
                        key={invoice.id}
                        className="rounded-[20px] border border-admin-line p-4 text-[14px]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-admin-ink">
                            Tagihan #{invoice.id} · {invoice.stage === "remaining" ? "Pelunasan" : "Awal"}
                          </p>
                          <StatusChip tone={info.tone}>{info.label}</StatusChip>
                        </div>
                        <p className="mt-2 text-[13px] text-admin-text-secondary">
                          Subtotal {rupiah(Number(invoice.subtotal_idr))} + kode{" "}
                          <span className="font-mono">{String(invoice.unique_code).padStart(3, "0")}</span> ={" "}
                          <strong className="font-semibold text-admin-ink">{rupiah(Number(invoice.total_idr))}</strong>
                        </p>
                        {invoice.reviewed_at && (
                          <p className="mt-1 text-[12px] text-admin-text-secondary">
                            Diperiksa {formatWib(invoice.reviewed_at)} WIB
                          </p>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </AdminSheet>
    </div>
  );
}
