"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarPlus, Package, Pencil } from "lucide-react";
import { FormDialog } from "@/components/admin/ui/form/FormDialog";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { AdminInput, AdminTextarea, CheckboxCard, PercentInput, PriceInput } from "@/components/admin/ui/form/controls";
import { StatusChip, rowActionClass } from "@/components/admin/ui/data-table";
import { RowActions } from "@/components/admin/ui/row-actions";
import { formatRupiah } from "@/lib/format";
import { CERTIFICATION_SLUG, SERIES_SLUG, SPEAKER_SLUG, bundleAddOn, bundlePriceValid } from "@/lib/bundle";
import { batchStatus, fromStoredSessions, nextBatchName, sessionCountOf, type SessionInput } from "@/lib/program-batch";
import { deleteBatch, saveBatch, saveBundle } from "@/app/(admin)/admin/program/actions";
import { SessionRows } from "./SessionRows";

export type BoardProgram = {
  slug: string;
  title: string;
  price_idr: number;
  original_price_idr: number | null;
  dp_percent: number | null;
  form_kind: string | null;
};
export type BoardBatch = {
  slug: string;
  program_slug: string;
  title: string;
  registration_open: boolean;
  sessions: unknown;
};
export type BoardBundle = {
  active: boolean;
  price_idr: number | null;
  dp_percent: number | null;
  description: string | null;
};

type BatchDraft = {
  slug: string | null;
  programSlug: string;
  programTitle: string;
  title: string;
  placeholder: string;
  sessions: SessionInput[];
  open: boolean;
};
type BundleDraft = { active: boolean; price: string; dp: string; description: string };

const ORDER: readonly string[] = [SERIES_SLUG, SPEAKER_SLUG, CERTIFICATION_SLUG];
const STATUS = {
  open: { tone: "mint", label: "Dibuka" },
  closed: { tone: "neutral", label: "Ditutup" },
  done: { tone: "neutral", label: "Selesai" },
} as const;
const pillClass = "inline-flex h-11 items-center gap-2 rounded-full border border-admin-line-strong px-5 text-[14px] font-medium text-admin-ink transition-colors hover:bg-admin-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";
const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

const dateLabel = (date: string) => (date ? dateFormat.format(new Date(`${date}T00:00:00+07:00`)) : "—");

function Warning({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[16px] bg-admin-butter-soft px-3 py-2 text-[13px] text-admin-butter-ink">{children}</p>;
}

/**
 * Satu layar Program & Batch (rancangan §5.3): program tetap dengan biayanya, daftar
 * batch per program, kartu paket, dan kartu Inhouse. Tidak ada tambah atau hapus program.
 */
export function ProgramBatchBoard({ programs, batches, bundle, inhouse, nowMs }: {
  programs: BoardProgram[];
  batches: BoardBatch[];
  bundle: BoardBundle | null;
  inhouse: { galleryCount: number; partnerCount: number };
  nowMs: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [batchDraft, setBatchDraft] = useState<BatchDraft | null>(null);
  const [bundleDraft, setBundleDraft] = useState<BundleDraft | null>(null);

  const publicTraining = ORDER.map((slug) => programs.find((program) => program.slug === slug)).filter((program): program is BoardProgram => !!program);
  const inhouseProgram = programs.find((program) => !ORDER.includes(program.slug));
  const priceOf = (slug: string) => Number(programs.find((program) => program.slug === slug)?.price_idr ?? 0);

  const rowsOf = (slug: string) =>
    batches
      .filter((batch) => batch.program_slug === slug)
      .map((batch) => ({ batch, sessions: fromStoredSessions(batch.sessions), status: batchStatus(batch, nowMs) }))
      .sort((a, b) => (b.sessions[0]?.date ?? "").localeCompare(a.sessions[0]?.date ?? ""));
  const hasOpen = (slug: string) => rowsOf(slug).some((row) => row.status === "open");

  function openCreate(program: BoardProgram) {
    setError(null);
    setBatchDraft({
      slug: null,
      programSlug: program.slug,
      programTitle: program.title,
      title: "",
      placeholder: nextBatchName(batches.filter((batch) => batch.program_slug === program.slug).map((batch) => batch.title)),
      sessions: [{ date: "", start: "", end: "" }],
      open: false,
    });
  }

  function openEdit(program: BoardProgram, batch: BoardBatch) {
    setError(null);
    const sessions = fromStoredSessions(batch.sessions);
    setBatchDraft({
      slug: batch.slug,
      programSlug: program.slug,
      programTitle: program.title,
      title: batch.title,
      placeholder: batch.title,
      sessions: sessions.length ? sessions : [{ date: "", start: "", end: "" }],
      open: batch.registration_open,
    });
  }

  function submitBatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!batchDraft) return;
    setError(null);
    startTransition(async () => {
      const result = await saveBatch({
        slug: batchDraft.slug,
        programSlug: batchDraft.programSlug,
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

  function submitBundle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  const packagePrice = Number(bundle?.price_idr ?? 0);
  const packageValid = bundlePriceValid(packagePrice, priceOf(SPEAKER_SLUG), priceOf(CERTIFICATION_SLUG));

  return <div className="space-y-6">
    <h2 className="text-[15px] font-semibold text-admin-ink">Public Training</h2>

    {publicTraining.map((program) => {
      const rows = rowsOf(program.slug);
      return <section key={program.slug} className="rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold text-admin-ink">{program.title}</h3>
            <p className="mt-0.5 text-[13px] text-admin-text-secondary">
              {Number(program.price_idr) > 0 ? formatRupiah(Number(program.price_idr)) : "Biaya belum diisi"}
              {program.original_price_idr ? <> · coret <del>{formatRupiah(Number(program.original_price_idr))}</del></> : null}
              {" · "}
              {program.dp_percent ? `DP ${program.dp_percent}%` : "Tanpa DP"}
            </p>
          </div>
          <Link href={`/admin/program/${program.slug}/edit`} aria-label={`Ubah ${program.title}`} title="Ubah program" className={rowActionClass}>
            <Pencil aria-hidden="true" size={18} strokeWidth={1.5} />
          </Link>
        </header>

        <div className="mt-4 divide-y divide-admin-line border-y border-admin-line">
          {rows.length === 0
            ? <p className="py-4 text-[14px] text-admin-text-secondary">Belum ada batch.</p>
            : rows.map(({ batch, sessions, status }) => (
              <div key={batch.slug} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-admin-ink" title={batch.title}>{batch.title}</p>
                <StatusChip tone={STATUS[status].tone}>{STATUS[status].label}</StatusChip>
                <p className="order-last w-full text-[13px] text-admin-text-secondary sm:order-none sm:w-auto">
                  {sessionCountOf(sessions)} sesi · mulai {dateLabel(sessions[0]?.date ?? "")}
                </p>
                <RowActions
                  itemName={`batch ${batch.title}`}
                  onEdit={() => openEdit(program, batch)}
                  onDelete={() => deleteBatch(batch.slug)}
                />
              </div>
            ))}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button type="button" onClick={() => openCreate(program)} className={`${pillClass} self-start`}>
            <CalendarPlus aria-hidden="true" size={16} strokeWidth={1.5} /> Tambah batch
          </button>
          {!(Number(program.price_idr) > 0) && <Warning>Biaya belum diisi; pendaftaran tidak bisa dibuka.</Warning>}
          {!hasOpen(program.slug) && <Warning>Belum ada batch yang dibuka.</Warning>}
        </div>
      </section>;
    })}

    <section className="rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-semibold text-admin-ink">Paket Speaker + Sertifikasi</h3>
            <StatusChip tone={bundle?.active ? "mint" : "neutral"}>{bundle?.active ? "Ditawarkan" : "Tidak ditawarkan"}</StatusChip>
          </div>
          <p className="mt-0.5 text-[13px] text-admin-text-secondary">
            {packagePrice > 0 ? formatRupiah(packagePrice) : "Harga paket belum diisi"}
            {bundle?.dp_percent ? ` · DP ${bundle.dp_percent}%` : null}
          </p>
          {packagePrice > 0 && (
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Dari Speaker: + {formatRupiah(bundleAddOn(packagePrice, priceOf(SPEAKER_SLUG)))}
              {" · "}
              Dari Sertifikasi: + {formatRupiah(bundleAddOn(packagePrice, priceOf(CERTIFICATION_SLUG)))}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Ubah paket Speaker + Sertifikasi"
          title="Ubah paket"
          className={rowActionClass}
          onClick={() => {
            setError(null);
            setBundleDraft({
              active: Boolean(bundle?.active),
              price: bundle?.price_idr ? String(bundle.price_idr) : "",
              dp: bundle?.dp_percent ? String(bundle.dp_percent) : "",
              description: bundle?.description ?? "",
            });
          }}
        >
          <Pencil aria-hidden="true" size={18} strokeWidth={1.5} />
        </button>
      </header>
      {bundle?.active && !packageValid && (
        <Warning>Harga paket tidak lagi sah terhadap biaya program; tawaran tidak tampil.</Warning>
      )}
      {bundle?.active && (!hasOpen(SPEAKER_SLUG) || !hasOpen(CERTIFICATION_SLUG)) && (
        <Warning>Tawaran tidak tampil sampai kedua program punya batch yang dibuka.</Warning>
      )}
    </section>

    <h2 className="pt-2 text-[15px] font-semibold text-admin-ink">In House Training</h2>

    {inhouseProgram && <section className="rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-admin-ink">{inhouseProgram.title}</h3>
          <p className="mt-0.5 text-[13px] text-admin-text-secondary">Konsultasi langsung, tanpa batch</p>
        </div>
        <Link href={`/admin/program/${inhouseProgram.slug}/edit`} aria-label={`Ubah ${inhouseProgram.title}`} title="Ubah program" className={rowActionClass}>
          <Pencil aria-hidden="true" size={18} strokeWidth={1.5} />
        </Link>
      </header>
    </section>}

    <section className="rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-admin-ink">Gallery Kegiatan</h3>
          <p className="mt-0.5 text-[13px] text-admin-text-secondary">{inhouse.galleryCount} foto</p>
        </div>
        <Link href="/admin/galeri" className={pillClass}>Kelola</Link>
      </header>
      {inhouse.galleryCount === 0 && <div className="mt-3"><Warning>Belum ada foto kegiatan.</Warning></div>}
    </section>

    <section className="rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-admin-ink">Our Partner</h3>
          <p className="mt-0.5 text-[13px] text-admin-text-secondary">{inhouse.partnerCount} logo</p>
        </div>
        <Link href="/admin/partner" className={pillClass}>Kelola</Link>
      </header>
      {inhouse.partnerCount === 0 && <div className="mt-3"><Warning>Belum ada logo partner.</Warning></div>}
    </section>

    <FormDialog
      open={Boolean(batchDraft)}
      onOpenChange={(open) => { if (!open) { setBatchDraft(null); setError(null); } }}
      icon={<CalendarPlus aria-hidden="true" size={20} strokeWidth={1.5} />}
      title={batchDraft?.slug ? "Ubah batch" : "Tambah batch"}
      description={batchDraft ? batchDraft.programTitle : undefined}
      submitLabel="Simpan batch"
      pending={pending}
      onSubmit={submitBatch}
    >
      {batchDraft && <FieldGrid columns={1}>
        <Field label="Nama batch" htmlFor="batch-title" required>
          <AdminInput
            id="batch-title"
            type="text"
            required
            aria-required="true"
            maxLength={160}
            placeholder={batchDraft.placeholder}
            value={batchDraft.title}
            onChange={(event) => setBatchDraft({ ...batchDraft, title: event.target.value })}
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
      </FieldGrid>}
    </FormDialog>

    <FormDialog
      open={Boolean(bundleDraft)}
      onOpenChange={(open) => { if (!open) { setBundleDraft(null); setError(null); } }}
      icon={<Package aria-hidden="true" size={20} strokeWidth={1.5} />}
      title="Paket Speaker + Sertifikasi"
      description="Satu harga paket; tambahan per arah dihitung dari biaya program."
      size="sm"
      submitLabel="Simpan paket"
      pending={pending}
      onSubmit={submitBundle}
    >
      {bundleDraft && <FieldGrid columns={1}>
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
            onChange={(event) => setBundleDraft({ ...bundleDraft, description: event.target.value })}
          />
        </Field>
        {error && <p role="alert" className="text-[13px] text-admin-danger">{error}</p>}
      </FieldGrid>}
    </FormDialog>
  </div>;
}
