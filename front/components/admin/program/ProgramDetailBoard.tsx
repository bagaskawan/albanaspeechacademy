"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Calendar, CalendarPlus, Eye, Images, Layers, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageActions } from "@/components/admin/PageHeader";
import { AdminSheet } from "@/components/admin/ui/AdminSheet";
import { DataTable, StatusChip, rowDangerActionClass } from "@/components/admin/ui/data-table";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { RowActions } from "@/components/admin/ui/row-actions";
import { FormDialog } from "@/components/admin/ui/form/FormDialog";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { AdminInput, AdminTextarea, CheckboxCard, PercentInput, PriceInput } from "@/components/admin/ui/form/controls";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { deleteBatch, saveBatch, saveBundle } from "@/app/(admin)/admin/program/actions";
import { useIsAdminSuper } from "@/components/admin/ui/row-actions";
import { CERTIFICATION_SLUG, SPEAKER_SLUG, bundleAddOn, bundlePriceValid } from "@/lib/bundle";
import { formatRupiah } from "@/lib/format";
import { batchStatus, fromStoredSessions, nextBatchName, type SessionInput } from "@/lib/program-batch";
import type { ProgramMediaItem } from "@/lib/program-media";
import { ProgramMediaEditor } from "./ProgramMediaEditor";
import type { BoardBatch, BoardBundle, BoardProgram } from "./ProgramBatchBoard";

type ProgramDetail = BoardProgram & { description: string | null };

const STATUS = {
  open: { tone: "mint", label: "Dibuka" },
  closed: { tone: "neutral", label: "Ditutup" },
  done: { tone: "neutral", label: "Selesai" },
} as const;

const pillClass =
  "inline-flex h-10 items-center gap-2 rounded-full border border-admin-line-strong bg-admin-canvas px-4 text-[14px] font-medium text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";
const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const dateLabel = (date: string) => (date ? dateFormat.format(new Date(`${date}T00:00:00+07:00`)) : "—");

function Warning({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[16px] bg-admin-butter-soft px-4 py-2.5 text-[13px] text-admin-butter-ink">{children}</p>;
}

function SessionRows({ sessions, onChange }: { sessions: SessionInput[]; onChange: (next: SessionInput[]) => void }) {
  const patch = (index: number, part: Partial<SessionInput>) =>
    onChange(sessions.map((item, i) => (i === index ? { ...item, ...part } : item)));

  return (
    <div className="space-y-3">
      {sessions.map((session, index) => (
        <div key={index} className="rounded-[20px] border border-admin-line p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-admin-text-secondary">Sesi {index + 1}</span>
            <button
              type="button"
              onClick={() => onChange(sessions.filter((_, i) => i !== index))}
              disabled={sessions.length === 1}
              aria-label={`Hapus sesi ${index + 1}`}
              className={rowDangerActionClass}
            >
              <Trash2 aria-hidden="true" size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <DatePicker
              value={session.date}
              onChange={(date) => patch(index, { date })}
              placeholder="Pilih tanggal"
              className="h-12 rounded-full border-admin-line bg-admin-surface px-4 text-sm text-admin-ink"
            />
            <TimePicker
              value={session.start}
              onChange={(start) => patch(index, { start })}
              placeholder="Jam mulai"
              className="h-12 rounded-full border-admin-line bg-admin-surface px-4 text-sm text-admin-ink"
            />
            <TimePicker
              value={session.end}
              onChange={(end) => patch(index, { end })}
              placeholder="Jam selesai"
              className="h-12 rounded-full border-admin-line bg-admin-surface px-4 text-sm text-admin-ink"
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...sessions, { date: "", start: "", end: "" }])} className={pillClass}>
        <Plus aria-hidden="true" size={16} strokeWidth={1.5} /> Tambah sesi
      </button>
    </div>
  );
}

export function ProgramDetailBoard({
  program,
  batches,
  bundle,
  speakerPrice,
  certificationPrice,
  bothProgramsHaveOpenBatch,
  media,
  nowMs,
}: {
  program: ProgramDetail;
  batches: BoardBatch[];
  bundle: BoardBundle | null;
  speakerPrice: number;
  certificationPrice: number;
  bothProgramsHaveOpenBatch: boolean;
  media: ProgramMediaItem[];
  nowMs: number;
}) {
  const router = useRouter();
  const isAdminSuper = useIsAdminSuper();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [detailBatch, setDetailBatch] = useState<{
    batch: BoardBatch;
    sessions: SessionInput[];
    status: keyof typeof STATUS;
  } | null>(null);
  const [batchDraft, setBatchDraft] = useState<{
    slug: string | null;
    title: string;
    placeholder: string;
    sessions: SessionInput[];
    open: boolean;
  } | null>(null);
  const [bundleDraft, setBundleDraft] = useState<{
    active: boolean;
    price: string;
    dp: string;
    description: string;
  } | null>(null);

  const supportsBundle = program.slug === SPEAKER_SLUG || program.slug === CERTIFICATION_SLUG;
  const rows = batches
    .map((batch) => ({ batch, sessions: fromStoredSessions(batch.sessions), status: batchStatus(batch, nowMs) }))
    .sort((a, b) => (b.sessions[0]?.date ?? "").localeCompare(a.sessions[0]?.date ?? ""));

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = normalizedQuery
    ? rows.filter(({ batch }) => batch.title.toLowerCase().includes(normalizedQuery))
    : rows;

  const openRow = rows.find((row) => row.status === "open");
  const openCount = rows.filter((row) => row.status === "open").length;
  const packagePrice = Number(bundle?.price_idr ?? 0);
  const packageValid = bundlePriceValid(packagePrice, speakerPrice, certificationPrice);

  function openCreateBatch() {
    setError(null);
    setBatchDraft({
      slug: null,
      title: "",
      placeholder: nextBatchName(batches.map((b) => b.title)),
      sessions: [{ date: "", start: "", end: "" }],
      open: false,
    });
  }

  function openEditBatch(batch: BoardBatch) {
    setError(null);
    const sessions = fromStoredSessions(batch.sessions);
    setBatchDraft({
      slug: batch.slug,
      title: batch.title,
      placeholder: batch.title,
      sessions: sessions.length ? sessions : [{ date: "", start: "", end: "" }],
      open: batch.registration_open,
    });
  }

  function submitBatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!batchDraft) return;
    setError(null);
    startTransition(async () => {
      const result = await saveBatch({
        slug: batchDraft.slug,
        programSlug: program.slug,
        title: batchDraft.title,
        sessions: batchDraft.sessions,
        open: batchDraft.open,
      });
      if (result.error) { setError(result.error); return; }
      setBatchDraft(null);
      toast.success(batchDraft.slug ? "Batch diperbarui." : "Batch ditambahkan.");
      router.refresh();
    });
  }

  function submitBundle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!bundleDraft) return;
    setError(null);
    startTransition(async () => {
      const result = await saveBundle({
        active: bundleDraft.active,
        priceIdr: Number(bundleDraft.price || 0),
        dpPercent: bundleDraft.dp ? Number(bundleDraft.dp) : null,
        description: bundleDraft.description,
      });
      if (result.error) { setError(result.error); return; }
      setBundleDraft(null);
      toast.success("Paket disimpan.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <AdminPageActions>
        <button type="button" onClick={() => setGalleryOpen(true)} className={`${pillClass} max-md:hidden`}>
          <Images aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Galeri</span>
        </button>
        <Link href={`/admin/program/${program.slug}/edit`} className={`${pillClass} max-md:hidden`}>
          <Pencil aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Edit Program</span>
        </Link>
      </AdminPageActions>

      {/* Kartu strip ringkasan 3 kolom */}
      <section className="grid gap-6 rounded-[var(--admin-radius-card)] border border-admin-line bg-admin-canvas p-6 md:grid-cols-3">
        <div className="flex items-start gap-3.5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-admin-line-strong bg-admin-surface text-admin-ink">
            <Banknote aria-hidden="true" size={18} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-admin-text-secondary">
              Biaya Program
            </p>
            <p className="mt-1 text-[16px] font-semibold text-admin-ink">
              {Number(program.price_idr) > 0 ? formatRupiah(Number(program.price_idr)) : "Belum diisi"}
            </p>
            <p className="mt-0.5 text-[12px] text-admin-text-secondary">
              {program.original_price_idr ? <>Coret {formatRupiah(Number(program.original_price_idr))} · </> : null}
              {program.dp_percent
                ? Number(program.price_idr) > 0
                  ? `DP ${program.dp_percent}% (${formatRupiah(Math.round((Number(program.price_idr) * Number(program.dp_percent)) / 100))})`
                  : `DP ${program.dp_percent}%`
                : "Tanpa DP"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-admin-line-strong bg-admin-surface text-admin-ink">
            <Calendar aria-hidden="true" size={18} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-admin-text-secondary">
              Batch Aktif
            </p>
            <p className="mt-1 truncate text-[16px] font-semibold text-admin-ink">
              {openRow ? openRow.batch.title : "Belum dibuka"}
            </p>
            <p className="mt-0.5 text-[12px] text-admin-text-secondary">
              {openRow
                ? `${openRow.sessions.length} sesi · mulai ${dateLabel(openRow.sessions[0]?.date ?? "")}`
                : "Buka salah satu batch agar bisa didaftar"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-admin-line-strong bg-admin-surface text-admin-ink">
            <Layers aria-hidden="true" size={18} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-admin-text-secondary">
              Total Batch
            </p>
            <p className="mt-1 text-[16px] font-semibold text-admin-ink">
              {rows.length} Batch
            </p>
            <p className="mt-0.5 text-[12px] text-admin-text-secondary">
              {openCount} dibuka
              {supportsBundle
                ? ` · Paket ${bundle?.active ? formatRupiah(packagePrice) : "nonaktif"}`
                : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Peringatan status */}
      {(
        !(Number(program.price_idr) > 0) ||
        !openRow ||
        (supportsBundle && bundle?.active && (!packageValid || !bothProgramsHaveOpenBatch))
      ) && (
        <div className="space-y-2">
          {!(Number(program.price_idr) > 0) && (
            <Warning>Biaya belum diisi; pendaftaran tidak bisa dibuka.</Warning>
          )}
          {!openRow && (
            <Warning>Belum ada batch yang dibuka untuk program ini.</Warning>
          )}
          {supportsBundle && bundle?.active && !packageValid && (
            <Warning>Harga paket tidak lagi sah terhadap biaya program; tawaran tidak tampil.</Warning>
          )}
          {supportsBundle && bundle?.active && !bothProgramsHaveOpenBatch && (
            <Warning>Tawaran paket tidak tampil sampai Speaker dan Sertifikasi sama-sama punya batch yang dibuka.</Warning>
          )}
        </div>
      )}

      {/* Bilah alat: Cari + Atur Paket + Tambah Batch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-[280px]">
          <Search
            aria-hidden="true"
            size={17}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-secondary"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama batch…"
            aria-label="Cari nama batch"
            className="admin-search"
          />
        </div>

        <div className="hidden flex-wrap items-center gap-2.5 md:flex">
          {supportsBundle && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setBundleDraft({
                  active: Boolean(bundle?.active),
                  price: bundle?.price_idr ? String(bundle.price_idr) : "",
                  dp: bundle?.dp_percent ? String(bundle.dp_percent) : "",
                  description: bundle?.description ?? "",
                });
              }}
              className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors ${
                bundle?.active
                  ? "border-admin-mint-dot/40 bg-admin-mint-soft text-admin-mint-ink hover:opacity-90"
                  : "border-admin-line-strong bg-admin-canvas text-admin-ink hover:bg-admin-surface"
              }`}
            >
              <Package aria-hidden="true" size={16} strokeWidth={1.5} />
              <span>{bundle?.active ? "Paket: Aktif" : "Atur Paket"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCreateBatch}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-admin-ink px-5 text-[14px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={1.5} />
            <span>Tambah Batch</span>
          </button>
        </div>
      </div>

      {/* Mobile floating action dock */}
      <div className="fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-1/2 z-40 flex w-max max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-1.5 rounded-full bg-admin-ink p-1.5 shadow-[var(--admin-shadow-overlay)] md:hidden">
        <button
          type="button"
          onClick={() => setGalleryOpen(true)}
          aria-label="Galeri & Dokumentasi"
          title="Galeri & Dokumentasi"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-admin-on-ink/85 transition-colors hover:bg-white/10"
        >
          <Images aria-hidden="true" size={18} strokeWidth={1.5} />
        </button>
        <Link
          href={`/admin/program/${program.slug}/edit`}
          aria-label="Edit Program"
          title="Edit Program"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-admin-on-ink/85 transition-colors hover:bg-white/10"
        >
          <Pencil aria-hidden="true" size={18} strokeWidth={1.5} />
        </Link>
        {supportsBundle && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setBundleDraft({
                active: Boolean(bundle?.active),
                price: bundle?.price_idr ? String(bundle.price_idr) : "",
                dp: bundle?.dp_percent ? String(bundle.dp_percent) : "",
                description: bundle?.description ?? "",
              });
            }}
            aria-label={bundle?.active ? "Paket aktif" : "Atur paket"}
            title={bundle?.active ? "Paket: Aktif" : "Atur Paket"}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-admin-on-ink/85 transition-colors hover:bg-white/10"
          >
            <Package aria-hidden="true" size={18} strokeWidth={1.5} />
          </button>
        )}
        <button
          type="button"
          onClick={openCreateBatch}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-admin-canvas px-4 text-[13px] font-semibold text-admin-ink shadow-sm transition-colors hover:bg-admin-surface"
        >
          <Plus aria-hidden="true" size={17} strokeWidth={1.75} />
          <span>Tambah Batch</span>
        </button>
      </div>

      {/* Daftar Batch */}
      {visibleRows.length === 0 ? (
        query ? (
          <EmptyState searching title="Tidak ada batch yang cocok" description="Coba kata kunci nama batch lain." />
        ) : (
          <EmptyState title="Belum ada batch" description={`Tambahkan batch pertama untuk ${program.title}.`} />
        )
      ) : (
        <>
          {/* Mobile clean white cards */}
          <div className="space-y-3.5 md:hidden">
            {visibleRows.map(({ batch, sessions, status }) => (
              <article
                key={`m-${batch.slug}`}
                className="rounded-[24px] border border-admin-line bg-admin-canvas p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-7 items-center rounded-full bg-admin-surface px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-admin-text-secondary">
                    {program.title}
                  </span>
                  <StatusChip tone={STATUS[status].tone}>{STATUS[status].label}</StatusChip>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[20px] font-bold leading-snug tracking-[-0.01em] text-admin-ink">
                      {batch.title}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-admin-text-secondary">
                      {sessions[0] ? `${sessions[0].start} – ${sessions[0].end} WIB` : "Belum ada jam sesi"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[15px] font-bold text-admin-ink">{sessions.length}</p>
                    <p className="text-[12px] text-admin-text-secondary">Sesi</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-admin-line pt-3.5">
                  <p className="font-mono text-[12px] text-admin-text-secondary">
                    Mulai: {dateLabel(sessions[0]?.date ?? "")}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailBatch({ batch, sessions, status })}
                      aria-label={`Detail batch ${batch.title}`}
                      title="Detail batch"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-admin-line bg-admin-canvas text-admin-ink transition-colors hover:bg-admin-surface"
                    >
                      <Eye aria-hidden="true" size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditBatch(batch)}
                      aria-label={`Ubah batch ${batch.title}`}
                      title="Ubah batch"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-admin-line bg-admin-canvas text-admin-ink transition-colors hover:bg-admin-surface"
                    >
                      <Pencil aria-hidden="true" size={16} strokeWidth={1.5} />
                    </button>
                    {isAdminSuper && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            const res = await deleteBatch(batch.slug);
                            if (res.error) toast.error(res.error);
                            else {
                              toast.success("Batch dihapus.");
                              router.refresh();
                            }
                          });
                        }}
                        aria-label={`Hapus batch ${batch.title}`}
                        title="Hapus batch"
                        className="inline-flex size-9 items-center justify-center rounded-full border border-admin-line bg-admin-canvas text-admin-danger transition-colors hover:bg-admin-rose-soft disabled:opacity-50"
                      >
                        <Trash2 aria-hidden="true" size={16} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <DataTable caption={`Daftar batch ${program.title}`}>
              <thead>
                <tr>
                  <th scope="col">Nama Batch</th>
                  <th scope="col">Status</th>
                  <th scope="col">Jadwal Mulai</th>
                  <th scope="col">Jumlah Sesi</th>
                  <th scope="col" className="text-right">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map(({ batch, sessions, status }) => (
                  <tr key={batch.slug}>
                    <td className="font-medium text-admin-ink">
                      {batch.title}
                    </td>
                    <td>
                      <StatusChip tone={STATUS[status].tone}>{STATUS[status].label}</StatusChip>
                    </td>
                    <td className="text-admin-text-secondary">
                      {dateLabel(sessions[0]?.date ?? "")}
                    </td>
                    <td className="text-admin-text-secondary">
                      {sessions.length} sesi
                    </td>
                    <td className="text-right">
                      <RowActions
                        itemName={`batch ${batch.title}`}
                        onEdit={() => openEditBatch(batch)}
                        onDelete={() => deleteBatch(batch.slug)}
                        extra={
                          <button
                            type="button"
                            onClick={() => setDetailBatch({ batch, sessions, status })}
                            aria-label={`Detail batch ${batch.title}`}
                            title="Detail batch"
                            className="inline-flex size-9 items-center justify-center rounded-full text-admin-ink transition-colors hover:bg-admin-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
                          >
                            <Eye aria-hidden="true" size={18} strokeWidth={1.5} />
                          </button>
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
        </>
      )}

      {/* Modal Detail Batch */}
      <AdminSheet
        open={detailBatch !== null}
        onOpenChange={(open) => { if (!open) setDetailBatch(null); }}
        icon={<Eye aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={detailBatch?.batch.title ?? "Detail batch"}
        description={program.title}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDetailBatch(null)}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface"
            >
              Tutup
            </button>
            {detailBatch && (
              <button
                type="button"
                onClick={() => {
                  const target = detailBatch.batch;
                  setDetailBatch(null);
                  openEditBatch(target);
                }}
                className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center gap-2 rounded-full bg-admin-ink text-[15px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft"
              >
                <Pencil aria-hidden="true" size={16} />
                <span>Ubah batch</span>
              </button>
            )}
          </>
        }
      >
        {detailBatch && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[20px] border border-admin-line bg-admin-surface px-4 py-3">
              <div>
                <p className="text-[12px] text-admin-text-secondary">Status pendaftaran</p>
                <div className="mt-1">
                  <StatusChip tone={STATUS[detailBatch.status].tone}>{STATUS[detailBatch.status].label}</StatusChip>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-admin-text-secondary">Jumlah sesi</p>
                <p className="mt-1 text-[14px] font-semibold text-admin-ink">{detailBatch.sessions.length} sesi</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[13px] font-medium text-admin-ink">Jadwal sesi (WIB)</p>
              {detailBatch.sessions.length === 0 ? (
                <p className="text-[13px] text-admin-text-secondary">Belum ada jadwal sesi.</p>
              ) : (
                <ul className="divide-y divide-admin-line rounded-[20px] border border-admin-line">
                  {detailBatch.sessions.map((session, idx) => (
                    <li key={idx} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[13px]">
                      <span className="font-medium text-admin-ink">Sesi {idx + 1}</span>
                      <span className="text-admin-text-secondary">
                        {dateLabel(session.date)} · {session.start} – {session.end} WIB
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </AdminSheet>

      {/* Modal Batch */}
      <FormDialog
        open={Boolean(batchDraft)}
        onOpenChange={(open) => { if (!open) { setBatchDraft(null); setError(null); } }}
        icon={<CalendarPlus aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={batchDraft?.slug ? "Ubah batch" : "Tambah batch"}
        description={program.title}
        submitLabel="Simpan batch"
        pending={pending}
        onSubmit={submitBatch}
      >
        {batchDraft && (
          <FieldGrid columns={1}>
            <Field label="Nama batch" htmlFor="batch-title" required>
              <AdminInput
                id="batch-title"
                type="text"
                required
                aria-required="true"
                maxLength={160}
                placeholder={batchDraft.placeholder}
                value={batchDraft.title}
                onChange={(e) => setBatchDraft({ ...batchDraft, title: e.target.value })}
              />
            </Field>
            <Field label="Jadwal sesi (WIB)" htmlFor="batch-sessions" required hint="Urut, tidak tumpang tindih, dan jam selesai setelah jam mulai.">
              <div id="batch-sessions">
                <SessionRows sessions={batchDraft.sessions} onChange={(sessions) => setBatchDraft({ ...batchDraft, sessions })} />
              </div>
            </Field>
            <CheckboxCard
              id="batch-open"
              checked={batchDraft.open}
              onCheckedChange={(open) => setBatchDraft({ ...batchDraft, open })}
              tone="mint"
              title="Buka pendaftaran"
              description="Membuka batch ini menutup pendaftaran batch lain di program yang sama."
            />
            {error && <p role="alert" className="text-[13px] text-admin-danger">{error}</p>}
          </FieldGrid>
        )}
      </FormDialog>

      {/* Modal Paket */}
      <FormDialog
        open={Boolean(bundleDraft)}
        onOpenChange={(open) => { if (!open) { setBundleDraft(null); setError(null); } }}
        icon={<Package aria-hidden="true" size={20} strokeWidth={1.5} />}
        title="Paket Speaker + Sertifikasi"
        description={
          packagePrice > 0
            ? `Dari Speaker: +${formatRupiah(bundleAddOn(packagePrice, speakerPrice))} · Dari Sertifikasi: +${formatRupiah(bundleAddOn(packagePrice, certificationPrice))}`
            : "Satu harga paket; tambahan per arah dihitung dari biaya program."
        }
        size="sm"
        submitLabel="Simpan paket"
        pending={pending}
        onSubmit={submitBundle}
      >
        {bundleDraft && (
          <FieldGrid columns={1}>
            <CheckboxCard
              id="bundle-active"
              checked={bundleDraft.active}
              onCheckedChange={(active) => setBundleDraft({ ...bundleDraft, active })}
              tone="mint"
              title="Tawarkan paket"
              description="Tampil di akhir formulir Speaker dan Sertifikasi."
            />
            <Field label="Harga paket" htmlFor="bundle-price" required>
              <PriceInput
                id="bundle-price"
                required
                aria-required="true"
                value={bundleDraft.price}
                onValueChange={(price) => setBundleDraft({ ...bundleDraft, price })}
              />
            </Field>
            <Field label="DP paket (%)" htmlFor="bundle-dp" hint="Kosongkan untuk memakai DP program asal." span="narrow">
              <PercentInput
                id="bundle-dp"
                value={bundleDraft.dp}
                onValueChange={(dp) => setBundleDraft({ ...bundleDraft, dp })}
              />
            </Field>
            <Field label="Penjelasan" htmlFor="bundle-description" hint="Satu kalimat, maksimal 300 karakter.">
              <AdminTextarea
                id="bundle-description"
                rows={3}
                maxLength={300}
                value={bundleDraft.description}
                onChange={(e) => setBundleDraft({ ...bundleDraft, description: e.target.value })}
              />
            </Field>
            {error && <p role="alert" className="text-[13px] text-admin-danger">{error}</p>}
          </FieldGrid>
        )}
      </FormDialog>

      {/* Modal Galeri & Dokumentasi */}
      <AdminSheet
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        icon={<Images aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={`Dokumentasi ${program.title}`}
        description={`Foto dan video khusus program ini (bucket ${program.slug}).`}
        size="lg"
        footer={
          <button
            type="button"
            onClick={() => setGalleryOpen(false)}
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface"
          >
            Tutup
          </button>
        }
      >
        <ProgramMediaEditor programSlug={program.slug} items={media} />
      </AdminSheet>
    </div>
  );
}
