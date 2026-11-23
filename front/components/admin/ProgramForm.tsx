"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminPageTitle } from "@/components/admin/PageHeader";
import { Field, FieldGrid, FormPage, FormSection } from "@/components/admin/ui/form/fields";
import { AdminInput, AdminTextarea, PercentInput, PriceInput } from "@/components/admin/ui/form/controls";
import { rowDangerActionClass } from "@/components/admin/ui/data-table";
import { INHOUSE_SLUG } from "@/lib/bundle";
import { formatRupiah } from "@/lib/format";

const toDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

type ProgramRow = {
  slug: string;
  title?: string | null;
  description?: string | null;
  price_idr?: number | null;
  original_price_idr?: number | null;
  dp_percent?: number | null;
  fee_details?: string | null;
  materials?: string[] | null;
};

// Program adalah daftar tetap: form ini hanya mengubah, tidak membuat.
export default function ProgramForm({ initialData }: { initialData: ProgramRow }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInhouse = initialData.slug === INHOUSE_SLUG;

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    price_idr: toDigits(initialData.price_idr),
    original_price_idr: toDigits(initialData.original_price_idr),
    dp_percent: initialData.dp_percent?.toString() ?? "",
    fee_details: initialData.fee_details || "",
  });

  const [materials, setMaterials] = useState<string[]>(
    Array.isArray(initialData.materials) ? initialData.materials : []
  );
  const materialRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaterialChange = (index: number, value: string) => {
    setMaterials((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleAddMaterial = () => {
    const nextIndex = materials.length;
    setMaterials((prev) => [...prev, ""]);
    requestAnimationFrame(() => {
      materialRefs.current[nextIndex]?.focus();
    });
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Nama program dan deskripsi wajib diisi.");
      return;
    }
    if (!isInhouse && !formData.price_idr) {
      setError("Biaya program wajib diisi.");
      return;
    }
    const price = Number(formData.price_idr || 0);
    const original = formData.original_price_idr ? Number(formData.original_price_idr) : null;
    const dp = formData.dp_percent ? Number(formData.dp_percent) : null;
    if (original !== null && original <= price) {
      setError("Harga coret harus lebih besar dari biaya.");
      return;
    }
    if (dp !== null && (!Number.isInteger(dp) || dp < 1 || dp > 99)) {
      setError("DP harus 1–99%.");
      return;
    }

    setIsSubmitting(true);
    const payload = isInhouse
      ? {
          title: formData.title.trim(),
          description: formData.description.trim(),
          materials: materials.map((item) => item.trim()).filter(Boolean),
        }
      : {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price_idr: price,
          original_price_idr: original,
          dp_percent: dp,
          fee_details: formData.fee_details.trim() || null,
          materials: materials.map((item) => item.trim()).filter(Boolean),
        };

    const supabase = createClient();
    const { error: saveError } = await supabase.from("programs").update(payload).eq("slug", initialData.slug);

    if (saveError) {
      setIsSubmitting(false);
      setError(saveError.message);
      return;
    }

    void fetch("/api/admin/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        module: "program",
        entityId: initialData.slug,
        entityLabel: formData.title.trim(),
        summary: `Memperbarui detail program "${formData.title.trim()}"`,
      }),
    }).catch(() => {});

    setIsSubmitting(false);

    const backHref = isInhouse ? "/admin/galeri" : `/admin/program/${initialData.slug}`;
    router.push(backHref);
    router.refresh();
  };

  const backHref = isInhouse ? "/admin/galeri" : `/admin/program/${initialData.slug}`;

  return (
    <>
      <AdminPageTitle>Ubah {initialData.title || initialData.slug}</AdminPageTitle>
      <FormPage
        width="double"
        cancelHref={backHref}
        submitLabel="Simpan program"
        pending={isSubmitting}
        onSubmit={handleSubmit}
      >
        {error && (
          <div role="alert" className="rounded-2xl bg-admin-rose-soft px-4 py-3 text-[13px] font-medium text-admin-danger">
            {error}
          </div>
        )}

        <FormSection number={1} title="Informasi utama">
          <div className="space-y-5">
            <FieldGrid columns={1}>
              <Field label="Nama Program" htmlFor="title" required>
                <AdminInput
                  id="title"
                  name="title"
                  required
                  aria-required="true"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Misal: Public Speaking Fundamental"
                />
              </Field>

              <Field label="Deskripsi Program" htmlFor="description" required>
                <AdminTextarea
                  id="description"
                  name="description"
                  required
                  aria-required="true"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan tujuan dan gambaran program ini..."
                />
              </Field>
            </FieldGrid>

            {!isInhouse && <>
              <FieldGrid columns={2} breakpoint="md">
                <Field label="Biaya" htmlFor="price_idr" required span="half" breakpoint="md">
                  <PriceInput
                    id="price_idr"
                    name="price_idr"
                    required
                    aria-required="true"
                    value={formData.price_idr}
                    onValueChange={(next) => setFormData((prev) => ({ ...prev, price_idr: next }))}
                    placeholder="1.300.000"
                  />
                </Field>
                <Field label="Harga Coret / Asli (Opsional)" htmlFor="original_price_idr" span="half" breakpoint="md">
                  <PriceInput
                    id="original_price_idr"
                    name="original_price_idr"
                    value={formData.original_price_idr}
                    onValueChange={(next) => setFormData((prev) => ({ ...prev, original_price_idr: next }))}
                    placeholder="1.500.000"
                  />
                </Field>
              </FieldGrid>

              <FieldGrid columns={1}>
                <Field
                  label="DP (%)"
                  htmlFor="dp_percent"
                  span="narrow"
                  hint={
                    Number(formData.price_idr) > 0 && Number(formData.dp_percent) > 0
                      ? `= ${formatRupiah(Math.round((Number(formData.price_idr) * Number(formData.dp_percent)) / 100))} saat DP`
                      : "Kosongkan bila DP tidak ditawarkan."
                  }
                >
                  <PercentInput
                    id="dp_percent"
                    name="dp_percent"
                    value={formData.dp_percent}
                    onValueChange={(next) => setFormData((prev) => ({ ...prev, dp_percent: next }))}
                    placeholder="20"
                  />
                </Field>
                <Field label="Rincian Biaya (Opsional)" htmlFor="fee_details">
                  <AdminTextarea
                    id="fee_details"
                    name="fee_details"
                    rows={3}
                    value={formData.fee_details}
                    onChange={handleChange}
                    placeholder="Termasuk modul, konsumsi, dan sertifikat."
                  />
                </Field>
              </FieldGrid>
            </>}
          </div>
        </FormSection>

        <FormSection number={2} title="Materi & benefit">
          <div className="space-y-3">
            {materials.map((material, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-admin-surface-muted font-mono text-[12px] font-semibold text-admin-text-secondary">
                  {index + 1}
                </span>
                <AdminInput
                  ref={(el) => { materialRefs.current[index] = el; }}
                  type="text"
                  value={material}
                  onChange={(e) => handleMaterialChange(index, e.target.value)}
                  placeholder="Nama materi / benefit program..."
                  aria-label={`Materi ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(index)}
                  className={rowDangerActionClass}
                  aria-label={`Hapus materi ${index + 1}`}
                  title="Hapus materi ini"
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
              onClick={handleAddMaterial}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-dashed border-admin-line-strong text-[14px] font-semibold text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
            >
              <Plus aria-hidden="true" size={16} strokeWidth={1.5} />
              <span>Tambah materi</span>
            </button>
          </div>
        </FormSection>
      </FormPage>
    </>
  );
}
