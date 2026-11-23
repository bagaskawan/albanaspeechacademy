"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { rowDangerActionClass } from "@/components/admin/ui/data-table";
import { AdminInput, AdminTextarea, PercentInput, PriceInput } from "@/components/admin/ui/form/controls";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { ProgramMediaEditor } from "@/components/admin/program/ProgramMediaEditor";
import { INHOUSE_SLUG } from "@/lib/bundle";
import { formatRupiah } from "@/lib/format";
import type { ProgramMediaItem } from "@/lib/program-media";

export type SettingsProgramRow = {
  slug: string;
  title: string | null;
  description: string | null;
  price_idr: number | null;
  original_price_idr: number | null;
  dp_percent: number | null;
  fee_details: string | null;
  materials: string[] | null;
};

const toDigits = (v: unknown) => String(v ?? "").replace(/\D/g, "");

function SingleProgramEditor({
  program,
  media,
}: {
  program: SettingsProgramRow;
  media?: ProgramMediaItem[];
}) {
  const router = useRouter();
  const isInhouse = program.slug === INHOUSE_SLUG;
  const [title, setTitle] = useState(program.title || "");
  const [description, setDescription] = useState(program.description || "");
  const [priceIdr, setPriceIdr] = useState(toDigits(program.price_idr));
  const [originalPriceIdr, setOriginalPriceIdr] = useState(toDigits(program.original_price_idr));
  const [dpPercent, setDpPercent] = useState(program.dp_percent?.toString() ?? "");
  const [feeDetails, setFeeDetails] = useState(program.fee_details || "");
  const [materials, setMaterials] = useState<string[]>(
    Array.isArray(program.materials) ? program.materials : []
  );
  const materialRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError("Nama program dan deskripsi wajib diisi.");
      return;
    }
    if (!isInhouse && !priceIdr) {
      setError("Biaya program wajib diisi.");
      return;
    }
    const price = Number(priceIdr || 0);
    const original = originalPriceIdr ? Number(originalPriceIdr) : null;
    const dp = dpPercent ? Number(dpPercent) : null;
    if (original !== null && original <= price) {
      setError("Harga coret harus lebih besar dari biaya.");
      return;
    }
    if (dp !== null && (!Number.isInteger(dp) || dp < 1 || dp > 99)) {
      setError("DP harus 1–99%.");
      return;
    }

    setSaving(true);
    const payload = isInhouse
      ? {
          title: title.trim(),
          description: description.trim(),
          materials: materials.map((m) => m.trim()).filter(Boolean),
        }
      : {
          title: title.trim(),
          description: description.trim(),
          price_idr: price,
          original_price_idr: original,
          dp_percent: dp,
          fee_details: feeDetails.trim() || null,
          materials: materials.map((m) => m.trim()).filter(Boolean),
        };

    const supabase = createClient();
    const { error: saveError } = await supabase.from("programs").update(payload).eq("slug", program.slug);
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    void fetch("/api/admin/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        module: "program",
        entityId: program.slug,
        entityLabel: title.trim(),
        summary: `Memperbarui detail program "${title.trim()}"`,
      }),
    }).catch(() => {});
    toast.success(`Detail ${title.trim()} disimpan.`);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div role="alert" className="rounded-2xl bg-admin-rose-soft px-4 py-3 text-[13px] font-medium text-admin-danger">
            {error}
          </div>
        )}

        <FieldGrid columns={1}>
          <Field label="Nama Program" htmlFor={`settings-${program.slug}-title`} required>
            <AdminInput
              id={`settings-${program.slug}-title`}
              required
              aria-required="true"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Deskripsi Program" htmlFor={`settings-${program.slug}-desc`} required>
            <AdminTextarea
              id={`settings-${program.slug}-desc`}
              required
              aria-required="true"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </FieldGrid>

        {!isInhouse && (
          <>
            <FieldGrid columns={2} breakpoint="md">
              <Field label="Biaya" htmlFor={`settings-${program.slug}-price`} required span="half" breakpoint="md">
                <PriceInput
                  id={`settings-${program.slug}-price`}
                  required
                  aria-required="true"
                  value={priceIdr}
                  onValueChange={setPriceIdr}
                />
              </Field>
              <Field label="Harga Coret / Asli (Opsional)" htmlFor={`settings-${program.slug}-orig`} span="half" breakpoint="md">
                <PriceInput
                  id={`settings-${program.slug}-orig`}
                  value={originalPriceIdr}
                  onValueChange={setOriginalPriceIdr}
                />
              </Field>
            </FieldGrid>

            <FieldGrid columns={1}>
              <Field
                label="DP (%)"
                htmlFor={`settings-${program.slug}-dp`}
                span="narrow"
                hint={
                  Number(priceIdr) > 0 && Number(dpPercent) > 0
                    ? `= ${formatRupiah(Math.round((Number(priceIdr) * Number(dpPercent)) / 100))} saat DP`
                    : "Kosongkan bila DP tidak ditawarkan."
                }
              >
                <PercentInput
                  id={`settings-${program.slug}-dp`}
                  value={dpPercent}
                  onValueChange={setDpPercent}
                />
              </Field>
              <Field label="Rincian Biaya (Opsional)" htmlFor={`settings-${program.slug}-fee`}>
                <AdminTextarea
                  id={`settings-${program.slug}-fee`}
                  rows={3}
                  value={feeDetails}
                  onChange={(e) => setFeeDetails(e.target.value)}
                />
              </Field>
            </FieldGrid>
          </>
        )}

        <div className="space-y-3 border-t border-admin-line pt-6">
          <p className="text-[13px] font-medium text-admin-ink">Materi &amp; benefit</p>
          {materials.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-admin-surface-muted font-mono text-[12px] font-semibold text-admin-text-secondary">
                {idx + 1}
              </span>
              <AdminInput
                ref={(el) => { materialRefs.current[idx] = el; }}
                type="text"
                value={item}
                onChange={(e) =>
                  setMaterials((prev) => prev.map((val, i) => (i === idx ? e.target.value : val)))
                }
                placeholder="Nama materi / benefit program..."
                aria-label={`Materi ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => setMaterials((prev) => prev.filter((_, i) => i !== idx))}
                className={rowDangerActionClass}
                aria-label={`Hapus materi ${idx + 1}`}
              >
                <Trash2 aria-hidden="true" size={18} strokeWidth={1.5} />
              </button>
            </div>
          ))}
          {materials.length === 0 && (
            <p className="rounded-[20px] border border-dashed border-admin-line p-8 text-center text-[13px] text-admin-text-secondary">
              Belum ada materi. Klik &ldquo;Tambah materi&rdquo; untuk menambahkan daftar benefit program.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              const nextIndex = materials.length;
              setMaterials((prev) => [...prev, ""]);
              requestAnimationFrame(() => {
                materialRefs.current[nextIndex]?.focus();
              });
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-dashed border-admin-line-strong text-[14px] font-semibold text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={1.5} />
            <span>Tambah materi</span>
          </button>
        </div>

        <div className="flex justify-end border-t border-admin-line pt-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-admin-ink px-5 text-[14px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft disabled:opacity-60"
          >
            <Save aria-hidden="true" size={16} strokeWidth={1.5} />
            <span>{saving ? "Menyimpan…" : "Simpan detail program"}</span>
          </button>
        </div>
      </form>

      {isInhouse && media && (
        <div className="border-t border-admin-line pt-6">
          <h3 className="mb-4 text-[15px] font-semibold text-admin-ink">Dokumentasi In House Training</h3>
          <ProgramMediaEditor programSlug={program.slug} items={media} />
        </div>
      )}
    </div>
  );
}

export function PublicTrainingSettingsClient({ programs }: { programs: SettingsProgramRow[] }) {
  const [selectedSlug, setSelectedSlug] = useState(programs[0]?.slug ?? "");
  const activeProgram = programs.find((p) => p.slug === selectedSlug) ?? programs[0];

  if (!activeProgram) {
    return <p className="text-[14px] text-admin-text-secondary">Belum ada program Public Training.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Pilih program Public Training">
        {programs.map((prog) => {
          const active = prog.slug === activeProgram.slug;
          return (
            <button
              key={prog.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedSlug(prog.slug)}
              className={`inline-flex h-10 items-center rounded-full px-4 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-admin-ink text-admin-on-ink"
                  : "border border-admin-line-strong bg-admin-surface text-admin-ink hover:bg-admin-surface-muted"
              }`}
            >
              {prog.title || prog.slug}
            </button>
          );
        })}
      </div>

      <SingleProgramEditor key={activeProgram.slug} program={activeProgram} />
    </div>
  );
}

export function InhouseTrainingSettingsClient({
  program,
  media,
}: {
  program: SettingsProgramRow | null;
  media: ProgramMediaItem[];
}) {
  if (!program) {
    return <p className="text-[14px] text-admin-text-secondary">Program In House Training belum tersedia.</p>;
  }
  return <SingleProgramEditor program={program} media={media} />;
}
