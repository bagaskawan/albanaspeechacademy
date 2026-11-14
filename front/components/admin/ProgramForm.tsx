"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { InputLine } from "@/components/ui/style-line/InputLine";
import { TextareaLine } from "@/components/ui/style-line/TextareaLine";

const formatNumber = (digits: string) =>
  digits ? new Intl.NumberFormat("id-ID").format(parseInt(digits, 10)) : "";

const toDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

type ProgramRow = {
  slug?: string;
  title?: string | null;
  description?: string | null;
  price_idr?: number | null;
  original_price_idr?: number | null;
  materials?: string[] | null;
  form_prior_experience?: string | null;
  form_goal?: string | null;
  form_challenge?: string | null;
};

export default function ProgramForm({ initialData = null }: { initialData?: ProgramRow | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price_idr: toDigits(initialData?.price_idr),
    original_price_idr: toDigits(initialData?.original_price_idr),
    form_prior_experience: initialData?.form_prior_experience || "",
    form_goal: initialData?.form_goal || "",
    form_challenge: initialData?.form_challenge || "",
  });

  const [materials, setMaterials] = useState<string[]>(
    Array.isArray(initialData?.materials) ? initialData.materials : []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
  };

  const handleMaterialChange = (index: number, value: string) => {
    setMaterials((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleAddMaterial = () => setMaterials((prev) => [...prev, ""]);

  const handleRemoveMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.description.trim() || !formData.price_idr) {
      setError("Nama program, deskripsi, dan harga promo wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price_idr: Number(formData.price_idr),
      original_price_idr: formData.original_price_idr ? Number(formData.original_price_idr) : null,
      materials: materials.map((item) => item.trim()).filter(Boolean),
      form_prior_experience: formData.form_prior_experience.trim() || null,
      form_goal: formData.form_goal.trim() || null,
      form_challenge: formData.form_challenge.trim() || null,
    };

    const supabase = createClient();
    const { error: saveError } = initialData?.slug
      ? await supabase.from("programs").update(payload).eq("slug", initialData.slug)
      : await supabase.from("programs").insert(payload);

    setIsSubmitting(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    router.push("/admin/program");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-3 pb-4 border-b border-border-default/60">
        <Link
          href="/admin/program"
          className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors shrink-0 cursor-pointer"
          title="Kembali ke Daftar Program"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
            [ PENGATURAN PROGRAM ]
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            {initialData ? "Edit Program" : "Tambah Program Baru"}
          </h1>
        </div>
      </div>

      <div className="bg-transparent sm:bg-bg-card border-0 sm:border border-border-default/70 p-1 sm:p-8 rounded-none sm:rounded-3xl shadow-none sm:shadow-xs space-y-8">
        {error && (
          <div role="alert" className="p-3 rounded-xl text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-border-default/40">
            <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-text-primary flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Informasi Utama Program
            </h2>
          </div>

          <div className="space-y-4">
            <InputLine
              label="Nama Program"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Misal: Public Speaking Fundamental"
            />

            <TextareaLine
              label="Deskripsi Program"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan tujuan dan gambaran program ini..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputLine
                label="Harga Promo"
                name="price_idr"
                required
                prefixText="Rp"
                inputMode="numeric"
                value={formatNumber(formData.price_idr)}
                onChange={handleMoneyChange}
                placeholder="349.000"
              />
              <InputLine
                label="Harga Coret / Asli (Opsional)"
                name="original_price_idr"
                prefixText="Rp"
                inputMode="numeric"
                value={formatNumber(formData.original_price_idr)}
                onChange={handleMoneyChange}
                placeholder="599.000"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border-default/40">
          <div className="flex items-center gap-2 pb-2 border-b border-border-default/40">
            <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-text-primary flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Formulir Pendaftaran
            </h2>
          </div>

          <p className="text-[11px] leading-relaxed text-text-secondary">
            Naskah pertanyaan di halaman daftar untuk program ini. Kosongkan bila cukup memakai naskah bawaan varian formulir batch.
          </p>

          <TextareaLine
            label="Pertanyaan pengalaman sebelumnya"
            name="form_prior_experience"
            rows={2}
            value={formData.form_prior_experience}
            onChange={handleChange}
            placeholder="Apakah pernah mengikuti pelatihan Public Speaking sebelumnya?"
          />
          <TextareaLine
            label="Pertanyaan tujuan mengikuti program"
            name="form_goal"
            rows={2}
            value={formData.form_goal}
            onChange={handleChange}
            placeholder="Apa tujuan utama mengikuti program ini?"
          />
          <TextareaLine
            label="Pertanyaan tantangan"
            name="form_challenge"
            rows={2}
            value={formData.form_challenge}
            onChange={handleChange}
            placeholder="Apa tantangan terbesar Anda dalam aktivitas Public Speaking?"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-border-default/40">
          <div className="flex items-center gap-2 pb-2 border-b border-border-default/40">
            <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-text-primary flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Materi & Benefit
            </h2>
          </div>

          <div className="space-y-2.5">
            {materials.map((material, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-bg-well/40 border border-border-default/70 p-3 rounded-xl"
              >
                <span className="text-[10px] font-bold font-mono text-text-muted w-4 shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => handleMaterialChange(index, e.target.value)}
                  placeholder="Nama materi / benefit program..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-xs font-medium text-text-primary placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(index)}
                  className="text-red-500 opacity-60 hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg transition-opacity shrink-0 cursor-pointer"
                  title="Hapus materi ini"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {materials.length === 0 && (
            <div className="text-center text-xs text-text-muted py-8 border border-dashed border-border-default rounded-xl bg-bg-well/30">
              Belum ada materi. Klik &ldquo;Tambah Materi&rdquo; untuk menambahkan daftar benefit program.
            </div>
          )}

          <button
            type="button"
            onClick={handleAddMaterial}
            className="w-full py-2.5 border border-dashed border-border-default text-xs text-text-secondary hover:text-text-primary hover:border-text-primary hover:bg-bg-well/50 rounded-xl font-bold flex justify-center items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Materi</span>
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-default/60">
          <Link
            href="/admin/program"
            className="h-10 px-5 text-xs font-bold rounded-xl text-text-secondary bg-bg-well hover:bg-bg-well/80 border border-border-default transition-colors flex items-center justify-center cursor-pointer"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-6 text-xs font-bold rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Menyimpan...</span>
            ) : (
              <>
                <Save size={15} />
                <span>Simpan Program</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
