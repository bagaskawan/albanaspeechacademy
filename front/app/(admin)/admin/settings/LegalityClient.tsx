"use client";

import { useRef, useState } from "react";
import { Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useSettingsForm } from "@/components/admin/settings/settings-forms";
import { saveAcademyLegality, type AcademyLegality } from "./legality-actions";

type SlotKey = keyof AcademyLegality;

function LegalityUploadCard({
  label,
  sublabel,
  aspectClass,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  aspectClass: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Gunakan gambar JPEG, PNG, atau WebP.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.set("purpose", "legality");
      body.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Gagal mengunggah gambar.");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setUploading(false);
    }
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void uploadFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role={value ? undefined : "button"}
        tabIndex={value || uploading ? undefined : 0}
        onClick={() => {
          if (!value && !uploading) inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if (!value && !uploading && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!uploading) setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={handleDrop}
        className={`group relative w-full overflow-hidden rounded-[22px] border-2 bg-admin-canvas p-2.5 transition-colors ${aspectClass} ${
          dragging
            ? "border-admin-ink bg-admin-surface"
            : value
              ? "border-admin-ink/85"
              : "cursor-pointer border-dashed border-admin-line-strong bg-admin-surface/40 hover:border-admin-ink/50 hover:bg-admin-surface"
        }`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="size-full rounded-[14px] bg-white object-contain"
            />
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-admin-ink px-3 text-[12px] font-medium text-admin-on-ink shadow-sm transition-colors hover:bg-admin-ink-soft disabled:opacity-50"
              >
                <RefreshCw aria-hidden="true" size={13} />
                <span>Ganti</span>
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  setError(null);
                  onChange("");
                }}
                aria-label={`Hapus ${label}`}
                className="inline-flex size-8 items-center justify-center rounded-full bg-admin-canvas text-admin-danger shadow-sm transition-colors hover:bg-admin-rose-soft"
              >
                <Trash2 aria-hidden="true" size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 rounded-[14px] px-4 text-center">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-admin-canvas text-admin-ink shadow-xs">
              {uploading ? (
                <Loader2 aria-hidden="true" size={18} className="animate-spin" />
              ) : (
                <UploadCloud aria-hidden="true" size={18} strokeWidth={1.5} />
              )}
            </span>
            <p className="text-[13px] font-medium text-admin-ink">
              {uploading ? "Mengunggah…" : "Tarik gambar ke sini atau klik"}
            </p>
            <p className="text-[11px] text-admin-text-secondary">JPEG, PNG, atau WebP</p>
          </div>
        )}

        {uploading && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-admin-canvas/75">
            <Loader2 aria-hidden="true" size={24} className="animate-spin text-admin-ink" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleSelect}
        />
      </div>

      <div className="text-center">
        <p className="text-[13px] font-bold uppercase tracking-[0.04em] text-admin-ink">{label}</p>
        {sublabel && <p className="mt-0.5 text-[12px] text-admin-text-secondary">{sublabel}</p>}
        {error && (
          <p role="alert" className="mt-1 text-[12px] text-admin-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export function LegalityClient({ initialLegality }: { initialLegality: AcademyLegality }) {
  const [draft, setDraft] = useState<AcademyLegality>(initialLegality);
  const [saved, setSaved] = useState<AcademyLegality>(initialLegality);
  const [statusError, setStatusError] = useState<string | null>(null);
  const sessionUploadsRef = useRef<Set<string>>(new Set());

  function cleanupTempUploads(urls: string[]) {
    if (urls.length === 0) return;
    fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    }).catch(() => {});
  }

  const dirty = (Object.keys(draft) as SlotKey[]).some((key) => draft[key] !== saved[key]);

  function patch(key: SlotKey, value: string) {
    setStatusError(null);
    const prevValue = draft[key];
    if (prevValue && prevValue !== value && sessionUploadsRef.current.has(prevValue)) {
      sessionUploadsRef.current.delete(prevValue);
      cleanupTempUploads([prevValue]);
    }
    if (value && value !== saved[key]) {
      sessionUploadsRef.current.add(value);
    }
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setStatusError(null);
    const res = await saveAcademyLegality(draft);
    if (!res.success) {
      setStatusError(res.error || "Gagal menyimpan legalitas.");
      return false;
    }
    const activeValues = new Set(Object.values(draft).filter(Boolean));
    const unused = Array.from(sessionUploadsRef.current).filter((u) => !activeValues.has(u));
    sessionUploadsRef.current.clear();
    cleanupTempUploads(unused);
    setSaved(draft);
    return true;
  }

  function reset() {
    if (sessionUploadsRef.current.size > 0) {
      cleanupTempUploads(Array.from(sessionUploadsRef.current));
      sessionUploadsRef.current.clear();
    }
    setDraft(saved);
    setStatusError(null);
  }

  useSettingsForm("legalitas", { dirty, save, reset });

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {statusError && (
        <div role="alert" className="rounded-xl border border-admin-rose-dot/30 bg-admin-rose-soft p-4 text-sm text-admin-danger">
          {statusError}
        </div>
      )}

      {/* Bagian 1: Dokumen Pendirian & Izin (3 kolom seperti gambar) */}
      <section className="rounded-[var(--admin-radius-card)] border border-admin-line bg-admin-canvas p-6 sm:p-8">
        <header className="mb-6 text-center">
          <h2 className="text-[18px] font-bold uppercase tracking-[0.06em] text-admin-ink">
            Legalitas
          </h2>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Unggah foto atau pindai dokumen legalitas resmi akademi.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <LegalityUploadCard
            label="Akta Pendirian CV"
            aspectClass="aspect-[3/4]"
            value={draft.akta_url}
            onChange={(url) => patch("akta_url", url)}
          />
          <LegalityUploadCard
            label="Nomor Induk Berusaha"
            aspectClass="aspect-[3/4]"
            value={draft.nib_url}
            onChange={(url) => patch("nib_url", url)}
          />
          <LegalityUploadCard
            label="Surat Keterangan Terdaftar"
            aspectClass="aspect-[3/4]"
            value={draft.skt_url}
            onChange={(url) => patch("skt_url", url)}
          />
        </div>
      </section>

      {/* Bagian 2: NPWP (2 kolom sisi depan & belakang seperti gambar) */}
      <section className="rounded-[var(--admin-radius-card)] border border-admin-line bg-admin-canvas p-6 sm:p-8">
        <header className="mb-6 text-center">
          <h2 className="text-[18px] font-bold uppercase tracking-[0.06em] text-admin-ink">
            NPWP
          </h2>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Unggah tampilan depan dan belakang kartu NPWP.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <LegalityUploadCard
            label="NPWP (Sisi Depan)"
            aspectClass="aspect-[16/10]"
            value={draft.npwp_front_url}
            onChange={(url) => patch("npwp_front_url", url)}
          />
          <LegalityUploadCard
            label="NPWP (Sisi Belakang)"
            aspectClass="aspect-[16/10]"
            value={draft.npwp_back_url}
            onChange={(url) => patch("npwp_back_url", url)}
          />
        </div>
      </section>
    </div>
  );
}
