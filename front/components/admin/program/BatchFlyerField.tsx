"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function BatchFlyerField({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!ALLOWED_TYPES.has(file.type)) {
      setUploadError("Gunakan gambar JPEG, PNG, atau WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 10 MB.");
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("purpose", "flyer");
      formData.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error || "Flyer belum bisa diunggah.");
        return;
      }
      onChange(data.url);
    } catch {
      setUploadError("Gagal terhubung ke server.");
    } finally {
      setUploading(false);
    }
  }

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleFile(file);
  }

  return (
    <div className="space-y-2.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelect}
        disabled={disabled || uploading}
        className="sr-only"
      />

      <div className="flex flex-col gap-4 rounded-[20px] border border-admin-line bg-admin-surface p-4 sm:flex-row sm:items-center">
        <div
          role={value || uploading || disabled ? undefined : "button"}
          tabIndex={value || uploading || disabled ? undefined : 0}
          onClick={() => {
            if (!value && !uploading && !disabled) inputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if (!value && !uploading && !disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-[14px] border bg-admin-canvas ${
            value
              ? "border-admin-line-strong"
              : "flex cursor-pointer flex-col items-center justify-center gap-1.5 border-dashed border-admin-line-strong text-admin-text-secondary transition-colors hover:border-admin-ink hover:text-admin-ink"
          }`}
        >
          {uploading ? (
            <div className="flex size-full flex-col items-center justify-center gap-1.5 text-admin-text-secondary">
              <Loader2 aria-hidden="true" size={20} className="animate-spin" />
              <span className="text-[11px]">Mengunggah…</span>
            </div>
          ) : value ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={value}
              alt="Pratinjau flyer batch"
              className="size-full object-contain bg-admin-surface"
            />
          ) : (
            <>
              <ImagePlus aria-hidden="true" size={20} strokeWidth={1.5} />
              <span className="text-[11px] font-medium">Flyer 4:5</span>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <p className="text-[13px] leading-relaxed text-admin-text-secondary">
            Unggah poster/flyer khusus batch ini (disarankan rasio 4:5). Jika dikosongkan, jadwal publik akan otomatis memakai gambar dari galeri program terkait.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-admin-line-strong bg-admin-canvas px-3.5 text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-surface-muted disabled:opacity-50"
            >
              {value ? <RefreshCw aria-hidden="true" size={14} strokeWidth={1.75} /> : <ImagePlus aria-hidden="true" size={14} strokeWidth={1.75} />}
              <span>{value ? "Ganti flyer" : "Pilih flyer"}</span>
            </button>
            {value && (
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => {
                  setUploadError(null);
                  onChange("");
                }}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-admin-line bg-admin-canvas px-3.5 text-[13px] font-medium text-admin-danger transition-colors hover:bg-admin-rose-soft disabled:opacity-50"
              >
                <Trash2 aria-hidden="true" size={14} strokeWidth={1.75} />
                <span>Hapus</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {uploadError && (
        <p role="alert" className="text-[12px] text-admin-danger">
          {uploadError}
        </p>
      )}
    </div>
  );
}
