"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Loader2, Play, RefreshCw, Trash2, UploadCloud, Video } from "lucide-react";
import { toast } from "sonner";
import { AdminSheet } from "@/components/admin/ui/AdminSheet";
import { AdminInput } from "@/components/admin/ui/form/controls";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { addProgramVideo, removeMultipleProgramMedia, removeProgramMedia } from "@/app/(admin)/admin/program/actions";
import {
  MAX_PROGRAM_PHOTOS,
  MAX_PROGRAM_VIDEOS,
  mediaCapacity,
  photoLimitError,
  type ProgramMediaItem,
} from "@/lib/program-media";

export function ProgramMediaEditor({
  programSlug,
  items,
}: {
  programSlug: string;
  items: ProgramMediaItem[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceSingleRef = useRef<HTMLInputElement>(null);
  const replaceMultiRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProgramMediaItem | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<number | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);
  const [confirmMultiDelete, setConfirmMultiDelete] = useState(false);
  const [replacedVersions, setReplacedVersions] = useState<Record<number, number>>({});
  const [isPending, startTransition] = useTransition();

  const photos = items.filter((item) => item.kind === "image");
  const videos = items.filter((item) => item.kind === "video");
  const cap = mediaCapacity(items);

  async function uploadFiles(selected: File[]) {
    if (selected.length === 0 || uploadProgress !== null) return;

    const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const validFiles = selected.filter((file) => acceptedTypes.has(file.type));
    const skippedTypeCount = selected.length - validFiles.length;
    if (validFiles.length === 0) {
      setUploadErrors(["Gunakan berkas gambar JPEG, PNG, atau WebP."]);
      return;
    }

    const errors: string[] = [];
    if (skippedTypeCount > 0) {
      errors.push(`${skippedTypeCount} berkas bukan JPEG/PNG/WebP dilewati.`);
    }

    let filesToUpload = validFiles;
    if (validFiles.length > cap.photoSlotsLeft) {
      filesToUpload = validFiles.slice(0, cap.photoSlotsLeft);
      errors.push(`Hanya ${cap.photoSlotsLeft} foto lagi yang bisa ditambahkan; ${validFiles.length - filesToUpload.length} berkas dilewati.`);
    }
    const limitErr = photoLimitError(cap.photos, filesToUpload.length);
    if (limitErr) {
      setUploadErrors([limitErr]);
      return;
    }

    setUploadErrors(errors);
    const cleanAlt = altText.trim();
    let uploadedCount = 0;

    for (let i = 0; i < filesToUpload.length; i += 1) {
      const file = filesToUpload[i];
      const fallbackAlt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Dokumentasi program";
      setUploadProgress({ current: i + 1, total: filesToUpload.length });
      const body = new FormData();
      body.set("purpose", "program");
      body.set("programSlug", programSlug);
      body.set("altText", cleanAlt || fallbackAlt);
      body.set("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          errors.push(`${file.name}: ${data.error || "Gagal mengunggah."}`);
        } else {
          uploadedCount += 1;
        }
      } catch {
        errors.push(`${file.name}: Gagal terhubung ke server.`);
      }
    }

    setUploadProgress(null);
    setUploadErrors([...errors]);
    if (uploadedCount > 0) {
      toast.success(`${uploadedCount} foto berhasil diunggah.`);
      router.refresh();
    }
  }

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    await uploadFiles(selected);
  }

  async function replacePhotos(targetIds: number[], selected: File[]) {
    if (targetIds.length === 0 || selected.length === 0 || uploadProgress !== null) return;
    const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const validFiles = selected.filter((file) => acceptedTypes.has(file.type));
    if (validFiles.length === 0) {
      setUploadErrors(["Gunakan berkas gambar JPEG, PNG, atau WebP."]);
      return;
    }

    const pairCount = Math.min(targetIds.length, validFiles.length);
    const errors: string[] = [];
    if (validFiles.length > targetIds.length) {
      errors.push(`Hanya ${targetIds.length} foto yang dipilih untuk diganti; ${validFiles.length - targetIds.length} berkas dilewati.`);
    }
    setUploadErrors(errors);

    const cleanAlt = altText.trim();
    let replacedCount = 0;

    for (let i = 0; i < pairCount; i += 1) {
      const assetId = targetIds[i];
      const file = validFiles[i];
      setUploadProgress({ current: i + 1, total: pairCount });

      const body = new FormData();
      body.set("purpose", "program");
      body.set("programSlug", programSlug);
      body.set("replaceAssetId", String(assetId));
      if (cleanAlt) body.set("altText", cleanAlt);
      body.set("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          errors.push(`${file.name}: ${data.error || "Gagal mengganti foto."}`);
        } else {
          replacedCount += 1;
          setReplacedVersions((prev) => ({ ...prev, [assetId]: Date.now() }));
        }
      } catch {
        errors.push(`${file.name}: Gagal terhubung ke server.`);
      }
    }

    setUploadProgress(null);
    setUploadErrors([...errors]);
    if (replacedCount > 0) {
      setSelectedPhotoIds([]);
      toast.success(`${replacedCount} foto berhasil diganti dan file lama dihapus.`);
      router.refresh();
    }
  }

  function togglePhotoSelection(id: number) {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function confirmMultiDeleteAction() {
    if (selectedPhotoIds.length === 0) return;
    const ids = [...selectedPhotoIds];
    setConfirmMultiDelete(false);
    startTransition(async () => {
      const res = await removeMultipleProgramMedia(ids);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setSelectedPhotoIds([]);
      toast.success(`${ids.length} foto dihapus dari galeri dan penyimpanan.`);
      router.refresh();
    });
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (cap.photoFull || uploadProgress !== null) return;
    const dropped = Array.from(e.dataTransfer.files ?? []);
    void uploadFiles(dropped);
  }

  function handleAddVideo() {
    setVideoError(null);
    startTransition(async () => {
      const res = await addProgramVideo({ programSlug, url: videoUrl, title: videoTitle });
      if (res.error) {
        setVideoError(res.error);
        return;
      }
      setVideoUrl("");
      setVideoTitle("");
      toast.success("Video YouTube ditambahkan.");
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    startTransition(async () => {
      const res = await removeProgramMedia(target.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(target.kind === "image" ? "Foto dihapus." : "Video dihapus.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <p className="text-[13px] text-admin-text-secondary">
        10–20 foto dan 1–2 video YouTube. Foto otomatis dikompresi ke WebP.
      </p>

      {/* Foto */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-[14px] font-semibold text-admin-ink">
              Foto{" "}
              <span className={cap.photosBelowMin ? "text-admin-peach-ink" : "text-admin-text-secondary"}>
                {cap.photos} / {MAX_PROGRAM_PHOTOS}
              </span>
            </h3>
            {cap.photosBelowMin && (
              <span className="rounded-full bg-admin-peach-soft px-2.5 py-0.5 text-[12px] font-medium text-admin-peach-ink">
                Disarankan minimal 10 foto
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={cap.photoFull || uploadProgress !== null}
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-admin-ink px-4 text-[13px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadProgress ? (
              <>
                <Loader2 aria-hidden="true" size={15} className="animate-spin" />
                <span>
                  Mengunggah {uploadProgress.current} dari {uploadProgress.total}…
                </span>
              </>
            ) : (
              <>
                <ImagePlus aria-hidden="true" size={15} />
                <span>+ Unggah foto</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFilesSelected}
          />
          <input
            ref={replaceSingleRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              const targetId = replaceTargetId;
              e.target.value = "";
              setReplaceTargetId(null);
              if (file && targetId !== null) {
                void replacePhotos([targetId], [file]);
              }
            }}
          />
          <input
            ref={replaceMultiRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length > 0 && selectedPhotoIds.length > 0) {
                void replacePhotos(selectedPhotoIds, files);
              }
            }}
          />
        </div>

        <FieldGrid columns={1}>
          <Field
            label="Keterangan gambar (opsional)"
            htmlFor="program-media-alt"
            hint="Jika dikosongkan, nama file digunakan otomatis sebagai keterangan."
          >
            <AdminInput
              id="program-media-alt"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Misal: Suasana praktik Public Speaking Series"
              maxLength={500}
            />
          </Field>
        </FieldGrid>

        {/* Dropzone drag & drop + pilih multiple */}
        <div
          role="button"
          tabIndex={cap.photoFull || uploadProgress !== null ? -1 : 0}
          aria-disabled={cap.photoFull || uploadProgress !== null}
          onClick={() => { if (!cap.photoFull && uploadProgress === null) fileRef.current?.click(); }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !cap.photoFull && uploadProgress === null) {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!cap.photoFull && uploadProgress === null) setIsDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!cap.photoFull && uploadProgress === null) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed px-6 py-7 text-center transition-colors ${
            cap.photoFull || uploadProgress !== null
              ? "cursor-not-allowed border-admin-line bg-admin-surface/60 opacity-60"
              : isDragging
                ? "cursor-copy border-admin-ink bg-admin-surface"
                : "cursor-pointer border-admin-line-strong bg-admin-surface/50 hover:border-admin-ink/50 hover:bg-admin-surface"
          }`}
        >
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-admin-canvas text-admin-ink shadow-xs">
            {uploadProgress ? (
              <Loader2 aria-hidden="true" size={20} className="animate-spin" />
            ) : (
              <UploadCloud aria-hidden="true" size={20} strokeWidth={1.5} />
            )}
          </span>
          <p className="text-[14px] font-medium text-admin-ink">
            {uploadProgress
              ? `Mengunggah ${uploadProgress.current} dari ${uploadProgress.total} foto…`
              : cap.photoFull
                ? "Batas 20 foto sudah tercapai"
                : "Tarik & lepas beberapa foto ke sini, atau klik untuk memilih"}
          </p>
          <p className="text-[12px] text-admin-text-secondary">
            Bisa pilih banyak file sekaligus (JPEG, PNG, WebP · maks. 10 MiB/foto).
          </p>
        </div>

        {uploadErrors.length > 0 && (
          <div role="alert" className="space-y-1 rounded-2xl bg-admin-rose-soft px-4 py-3 text-[12px] text-admin-danger">
            {uploadErrors.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </div>
        )}

        {photos.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-admin-line bg-admin-surface/60 px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPhotoIds.length === photos.length) {
                      setSelectedPhotoIds([]);
                    } else {
                      setSelectedPhotoIds(photos.map((p) => p.id));
                    }
                  }}
                  className="text-[12px] font-medium text-admin-ink underline underline-offset-4 hover:text-admin-text-secondary cursor-pointer"
                >
                  {selectedPhotoIds.length === photos.length ? "Batal pilih semua" : "Pilih semua foto"}
                </button>
                {selectedPhotoIds.length > 0 && (
                  <span className="text-[12px] text-admin-text-secondary">
                    · {selectedPhotoIds.length} terpilih
                  </span>
                )}
              </div>

              {selectedPhotoIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={uploadProgress !== null || isPending}
                    onClick={() => replaceMultiRef.current?.click()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-admin-line-strong bg-admin-canvas px-3 text-[12px] font-medium text-admin-ink transition-colors hover:bg-admin-surface disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw aria-hidden="true" size={13} />
                    <span>Ganti {selectedPhotoIds.length} foto</span>
                  </button>
                  <button
                    type="button"
                    disabled={uploadProgress !== null || isPending}
                    onClick={() => setConfirmMultiDelete(true)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-admin-danger px-3 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 aria-hidden="true" size={13} />
                    <span>Hapus {selectedPhotoIds.length} foto</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo) => {
                const isSelected = selectedPhotoIds.includes(photo.id);
                const version = replacedVersions[photo.id];
                const imgSrc = version ? `${photo.src}${photo.src.includes("?") ? "&" : "?"}v=${version}` : photo.src;
                return (
                  <div
                    key={photo.id}
                    className={`group relative aspect-[4/3] overflow-hidden rounded-[20px] border bg-admin-surface transition-all ${
                      isSelected ? "border-admin-ink ring-2 ring-admin-ink/30" : "border-admin-line"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt={photo.alt} className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => togglePhotoSelection(photo.id)}
                      aria-pressed={isSelected}
                      aria-label={`Pilih foto ${photo.alt || photo.id}`}
                      className={`absolute left-2 top-2 inline-flex size-7 items-center justify-center rounded-full border shadow-sm transition-colors cursor-pointer ${
                        isSelected
                          ? "border-admin-ink bg-admin-ink text-admin-on-ink"
                          : "border-admin-line bg-admin-canvas/90 text-transparent hover:border-admin-ink"
                      }`}
                    >
                      <Check aria-hidden="true" size={14} />
                    </button>
                    <div className="absolute right-2 top-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={uploadProgress !== null || isPending}
                        onClick={() => {
                          setReplaceTargetId(photo.id);
                          replaceSingleRef.current?.click();
                        }}
                        aria-label={`Ganti foto ${photo.alt || photo.id}`}
                        title="Ganti foto"
                        className="inline-flex size-8 items-center justify-center rounded-full bg-admin-canvas/90 text-admin-ink shadow-sm transition-colors hover:bg-admin-surface disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw aria-hidden="true" size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={uploadProgress !== null || isPending}
                        onClick={() => setDeleteTarget(photo)}
                        aria-label={`Hapus foto ${photo.alt || photo.id}`}
                        title="Hapus foto"
                        className="inline-flex size-8 items-center justify-center rounded-full bg-admin-canvas/90 text-admin-danger shadow-sm transition-colors hover:bg-admin-rose-soft disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 aria-hidden="true" size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="rounded-[20px] border border-dashed border-admin-line px-4 py-6 text-center text-[13px] text-admin-text-secondary">
            Belum ada foto dokumentasi untuk program ini.
          </p>
        )}
      </div>

      {/* Video YouTube */}
      <div className="space-y-4 border-t border-admin-line pt-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-[14px] font-semibold text-admin-ink">
            Video{" "}
            <span className={cap.videosBelowMin ? "text-admin-peach-ink" : "text-admin-text-secondary"}>
              {cap.videos} / {MAX_PROGRAM_VIDEOS}
            </span>
          </h3>
          {cap.videosBelowMin && (
            <span className="rounded-full bg-admin-peach-soft px-2.5 py-0.5 text-[12px] font-medium text-admin-peach-ink">
              Disarankan minimal 1 video
            </span>
          )}
        </div>

        {videos.length > 0 && (
          <ul className="space-y-2">
            {videos.map((video) => (
              <li
                key={video.id}
                className="flex items-center justify-between gap-3 rounded-[20px] border border-admin-line bg-admin-surface px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-admin-canvas text-admin-ink">
                    <Play aria-hidden="true" size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-admin-ink">{video.alt}</p>
                    <p className="truncate text-[12px] text-admin-text-secondary">{video.src}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setDeleteTarget(video)}
                  aria-label={`Hapus video ${video.alt}`}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-admin-danger transition-colors hover:bg-admin-rose-soft"
                >
                  <Trash2 aria-hidden="true" size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-3 rounded-[20px] border border-admin-line bg-admin-surface/50 p-4">
          <FieldGrid columns={2} breakpoint="md">
            <Field
              label="URL YouTube"
              htmlFor="program-video-url"
              span="half"
              breakpoint="md"
              hint="Gunakan tautan unlisted atau private."
            >
              <AdminInput
                id="program-video-url"
                type="url"
                disabled={cap.videoFull || isPending}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/..."
              />
            </Field>
            <Field label="Judul video" htmlFor="program-video-title" span="half" breakpoint="md">
              <AdminInput
                id="program-video-title"
                type="text"
                disabled={cap.videoFull || isPending}
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Misal: Highlight Kelas Batch 9"
                maxLength={160}
              />
            </Field>
          </FieldGrid>

          {videoError && (
            <p role="alert" className="text-[12px] text-admin-danger">
              {videoError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={cap.videoFull || isPending}
              onClick={handleAddVideo}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-admin-line-strong bg-admin-canvas px-4 text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Video aria-hidden="true" size={15} />
              <span>{isPending ? "Menyimpan…" : "Tambah video"}</span>
            </button>
          </div>
        </div>
      </div>

      <AdminSheet
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        tone="danger"
        size="sm"
        icon={<Trash2 aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={deleteTarget?.kind === "image" ? "Hapus foto ini?" : `Hapus "${deleteTarget?.alt ?? "video"}"?`}
        description="Tindakan ini tidak dapat dibatalkan."
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isPending}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full bg-admin-danger text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Menghapus…" : "Hapus"}
            </button>
          </>
        }
      >
        <p className="text-[14px] text-admin-text-secondary">
          {deleteTarget?.kind === "image"
            ? "Foto akan dihapus dari galeri program dan penyimpanan."
            : "Tautan video YouTube akan dihapus dari dokumentasi program."}
        </p>
      </AdminSheet>

      <AdminSheet
        open={confirmMultiDelete}
        onOpenChange={setConfirmMultiDelete}
        tone="danger"
        size="sm"
        icon={<Trash2 aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={`Hapus ${selectedPhotoIds.length} foto terpilih?`}
        description="Tindakan ini tidak dapat dibatalkan."
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmMultiDelete(false)}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmMultiDeleteAction}
              disabled={isPending}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full bg-admin-danger text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Menghapus…" : "Hapus semua"}
            </button>
          </>
        }
      >
        <p className="text-[14px] text-admin-text-secondary">
          Semua foto yang dipilih akan dihapus permanen dari galeri program dan penyimpanan.
        </p>
      </AdminSheet>
    </div>
  );
}
