"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { ArticleBlockEditorHandle } from "./ArticleBlockEditor";
import {
  articleBlocksToText,
  articleHasText,
  deriveExcerpt,
  hasMissingImageAlt,
  readingMinutes,
  titleBlock,
  type ArticleBlock,
} from "@/lib/article-blocks";
import { uploadArticleImage } from "@/lib/article-image-upload";
import {
  deleteArticleAction,
  saveArticleAction,
  unpublishArticleAction,
} from "@/lib/actions/article-actions";

const ArticleBlockEditor = dynamic(() => import("./ArticleBlockEditor"), {
  ssr: false,
  loading: () => (
    <div aria-busy="true" aria-label="Memuat editor artikel" className="space-y-4 py-4">
      <div className="h-5 w-4/5 rounded bg-admin-surface-muted motion-safe:animate-pulse" />
      <div className="h-5 w-full rounded bg-admin-surface-muted motion-safe:animate-pulse" />
      <div className="h-5 w-11/12 rounded bg-admin-surface-muted motion-safe:animate-pulse" />
      <div className="h-5 w-2/3 rounded bg-admin-surface-muted motion-safe:animate-pulse" />
    </div>
  ),
});

const AUTOSAVE_MS = 1500;
const MAX_TITLE_INPUT = 120;

export type ArticleEditorData = {
  slug: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  blocks: ArticleBlock[];
  thumbnailImageId?: string | null;
};

function formatDateLong(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(date);
}

function formatTimeShort(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function ArticleEditor({
  article,
  isSuperAdmin = false,
}: {
  article: ArticleEditorData | null;
  isSuperAdmin?: boolean;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(article?.slug ?? null);
  const [title, setTitle] = useState(article?.title ?? "");
  const [published, setPublished] = useState(article?.published ?? false);
  const [publishedAt, setPublishedAt] = useState<string | null>(article?.publishedAt ?? null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(article?.updatedAt ?? null);
  const [thumbnailImageId, setThumbnailImageId] = useState<string | null>(article?.thumbnailImageId ?? null);

  const [dirty, setDirty] = useState(false);
  const [editSeq, setEditSeq] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);
  const online = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("online", onStoreChange);
      window.addEventListener("offline", onStoreChange);
      return () => {
        window.removeEventListener("online", onStoreChange);
        window.removeEventListener("offline", onStoreChange);
      };
    },
    () => navigator.onLine,
    () => true,
  );
  const [scrolled, setScrolled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [lastFailedPublish, setLastFailedPublish] = useState<boolean | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const [editorSeed] = useState<ArticleBlock[]>(() => article?.blocks ?? []);
  const blocksRef = useRef<ArticleBlock[]>(editorSeed);
  const [liveBlocks, setLiveBlocks] = useState<ArticleBlock[]>(editorSeed);
  const getBlocksRef = useRef<(() => ArticleBlock[]) | null>(null);
  const editorHandleRef = useRef<ArticleBlockEditorHandle | null>(null);
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  const seqRef = useRef(0);
  const inFlightRef = useRef(false);
  const slugRef = useRef<string | null>(slug);
  const updatedAtRef = useRef<string | null>(updatedAt);

  useEffect(() => {
    slugRef.current = slug;
    updatedAtRef.current = updatedAt;
  }, [slug, updatedAt]);

  const currentBodyBlocks = useCallback(() => {
    const live = getBlocksRef.current?.();
    if (live) blocksRef.current = live;
    return blocksRef.current;
  }, []);

  // Auto-resize title textarea.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  const markDirty = useCallback(() => {
    seqRef.current += 1;
    setEditSeq(seqRef.current);
    setDirty(true);
    setSaveError(null);
  }, []);

  const save = useCallback(
    async (shouldPublish: boolean, auto: boolean): Promise<boolean> => {
      if (inFlightRef.current || uploadingCount > 0 || thumbUploading) return false;

      const cleanTitle = title.trim();
      const bodyBlocks = currentBodyBlocks();
      const localFields: Record<string, string> = {};
      if (!cleanTitle) localFields.title = "Isi judul artikel.";
      if (!articleHasText(bodyBlocks)) localFields.blocks = "Tulis minimal satu paragraf.";
      if (shouldPublish && hasMissingImageAlt(bodyBlocks)) {
        localFields.alt = "Tambahkan teks alternatif untuk gambar ini.";
      }

      if (Object.keys(localFields).length) {
        if (auto) return false;
        setFieldErrors(localFields);
        if (localFields.title) titleRef.current?.focus();
        else if (localFields.alt) editorHandleRef.current?.focusFirstMissingAlt();
        else editorHandleRef.current?.focusStart();
        return false;
      }

      const snapshotSeq = seqRef.current;
      inFlightRef.current = true;
      setSaving(true);
      setSaveError(null);
      setConflict(false);
      setFieldErrors({});

      try {
        const result = await saveArticleAction({
          slug: slugRef.current,
          blocks: [titleBlock(cleanTitle), ...bodyBlocks],
          publish: shouldPublish,
          expectedUpdatedAt: updatedAtRef.current,
          thumbnailImageId,
        });

        if (!result.ok) {
          if (result.conflict) {
            setConflict(true);
          } else {
            setSaveError(result.error);
            setLastFailedPublish(shouldPublish);
          }
          if (result.fields) setFieldErrors(result.fields);
          return false;
        }

        const created = !slugRef.current;
        slugRef.current = result.slug;
        updatedAtRef.current = result.updatedAt;
        setSlug(result.slug);
        setUpdatedAt(result.updatedAt);
        setPublishedAt(result.publishedAt);
        setPublished(shouldPublish);
        setSavedOnce(true);
        setLastFailedPublish(null);

        if (seqRef.current === snapshotSeq) {
          setDirty(false);
        }

        if (shouldPublish && !auto) {
          toast.success("Artikel diterbitkan.", {
            action: {
              label: "Lihat",
              onClick: () => window.open(`/artikel/${result.slug}`, "_blank", "noopener,noreferrer"),
            },
          });
        }
        if (created) {
          router.replace(`/admin/artikel/${result.slug}`);
        }
        return true;
      } catch {
        setSaveError("Gagal menyimpan");
        setLastFailedPublish(shouldPublish);
        return false;
      } finally {
        inFlightRef.current = false;
        setSaving(false);
      }
    },
    [currentBodyBlocks, router, thumbUploading, thumbnailImageId, title, uploadingCount],
  );

  // Autosave after 1.5s of inactivity when online, no uploads in progress, and no conflict.
  useEffect(() => {
    if (!dirty || saving || conflict || !online || uploadingCount > 0 || thumbUploading) return;
    if (!title.trim() || !articleHasText(currentBodyBlocks())) return;
    const timer = setTimeout(() => {
      void save(published, true);
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [dirty, editSeq, saving, conflict, online, uploadingCount, thumbUploading, title, published, currentBodyBlocks, save]);

  // Ctrl/Cmd + S shortcut.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save(published, false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [published, save]);

  const handleThumbnailUpload = async (file: File) => {
    setThumbError(null);
    setThumbUploading(true);
    try {
      const uploaded = await uploadArticleImage(file, "thumbnail");
      setThumbnailImageId(uploaded.id);
      markDirty();
    } catch (err) {
      setThumbError(err instanceof Error ? err.message : "Thumbnail gagal diunggah.");
    } finally {
      setThumbUploading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!slug) return;
    setSaving(true);
    const result = await unpublishArticleAction(slug, updatedAt);
    setSaving(false);
    if (!result.ok) {
      if (result.conflict) setConflict(true);
      else setSaveError(result.error);
      setUnpublishDialogOpen(false);
      return;
    }
    setPublished(false);
    setUpdatedAt(result.updatedAt);
    updatedAtRef.current = result.updatedAt;
    setUnpublishDialogOpen(false);
    toast.success("Artikel ditarik ke draf.");
  };

  const handleDelete = async () => {
    if (!slug) return;
    setSaving(true);
    const result = await deleteArticleAction(slug);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      setDeleteDialogOpen(false);
      return;
    }
    toast.success("Artikel dihapus.");
    router.push("/admin/artikel");
  };

  const derivedExcerpt = useMemo(() => deriveExcerpt(liveBlocks) || title.trim(), [liveBlocks, title]);
  const minutes = useMemo(() => readingMinutes(articleBlocksToText(liveBlocks)), [liveBlocks]);
  const missingAlt = useMemo(() => hasMissingImageAlt(liveBlocks), [liveBlocks]);
  const hasTitle = title.trim().length > 0;
  const hasBody = useMemo(() => articleHasText(liveBlocks), [liveBlocks]);
  const readyToPublish = hasTitle && hasBody && !missingAlt;

  const thumbnailUrl = thumbnailImageId ? `/api/article-images/${thumbnailImageId}` : null;

  const renderStatus = () => {
    if (conflict) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-rose-ink">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden md:inline">Diubah di tab lain</span>
          <span className="md:hidden">Konflik</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="underline hover:no-underline"
          >
            Muat ulang
          </button>
        </span>
      );
    }
    if (!online) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-admin-text-secondary">
          <span className="hidden md:inline">Offline — perubahan disimpan saat tersambung</span>
          <span className="md:hidden">Offline</span>
        </span>
      );
    }
    if (uploadingCount > 0 || thumbUploading) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-admin-text-secondary">
          <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
          <span className="hidden md:inline">Menunggu unggahan gambar…</span>
          <span className="md:hidden">Mengunggah…</span>
        </span>
      );
    }
    if (saving) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-admin-text-secondary">
          <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
          <span>Menyimpan…</span>
        </span>
      );
    }
    if (saveError) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-rose-ink">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden md:inline">Gagal menyimpan</span>
          <span className="md:hidden">Gagal</span>
          <button
            type="button"
            onClick={() => void save(lastFailedPublish ?? published, false)}
            className="underline hover:no-underline"
          >
            Coba lagi
          </button>
        </span>
      );
    }
    if (dirty) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-admin-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          <span>Belum tersimpan</span>
        </span>
      );
    }
    const timeStr = savedOnce ? formatTimeShort(updatedAt) : "";
    return (
      <span className="inline-flex items-center gap-1 text-xs text-admin-text-secondary">
        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        <span className="hidden md:inline">{timeStr ? `Tersimpan ${timeStr}` : "Tersimpan"}</span>
        <span className="md:hidden">Tersimpan</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-admin-canvas">
      {/* Sticky editor header (§B.2) */}
      <header
        className={`sticky top-0 z-20 flex h-14 items-center justify-between gap-3 bg-admin-canvas px-4 md:px-6 ${
          scrolled ? "border-b border-admin-line" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin/artikel"
            aria-label="Kembali ke daftar artikel"
            onClick={(e) => {
              if (dirty) {
                e.preventDefault();
                setLeaveDialogOpen(true);
              }
            }}
            className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 text-sm font-medium text-admin-text-secondary hover:text-admin-ink md:min-w-0"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden md:inline">Artikel</span>
          </Link>

          <span
            className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-flex ${
              published ? "bg-emerald-50 text-emerald-800" : "bg-admin-surface-muted text-admin-text-secondary"
            }`}
          >
            {published ? "Terbit" : "Draf"}
          </span>

          <div role="status" aria-live="polite" className="truncate">
            {renderStatus()}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => setDetailOpen((v) => !v)}
            className="min-h-[38px] rounded-md border border-admin-line px-3 text-sm font-medium text-admin-ink hover:bg-admin-surface"
          >
            Detail
          </button>
          {!published ? (
            <button
              type="button"
              title="Simpan draf (Ctrl/⌘ + S)"
              disabled={saving || uploadingCount > 0 || thumbUploading}
              onClick={() => void save(false, false)}
              className="min-h-[38px] rounded-md border border-admin-line px-3 text-sm font-medium text-admin-ink hover:bg-admin-surface disabled:opacity-50"
            >
              Simpan draf
            </button>
          ) : slug ? (
            <Link
              href={`/artikel/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-admin-line px-3 text-sm font-medium text-admin-ink hover:bg-admin-surface"
            >
              Lihat publik
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : null}

          <button
            type="button"
            disabled={saving || uploadingCount > 0 || thumbUploading}
            onClick={() => setPublishDialogOpen(true)}
            className="min-h-[38px] rounded-md bg-admin-ink px-4 text-sm font-medium text-admin-on-ink hover:opacity-90 disabled:opacity-50"
          >
            {published ? "Perbarui" : "Terbitkan"}
          </button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            disabled={saving || uploadingCount > 0 || thumbUploading}
            onClick={() => setPublishDialogOpen(true)}
            className="min-h-[38px] rounded-md bg-admin-ink px-3.5 text-sm font-medium text-admin-on-ink disabled:opacity-50"
          >
            {published ? "Perbarui" : "Terbitkan"}
          </button>
          <button
            type="button"
            aria-label="Aksi lain"
            onClick={() => setMobileActionsOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-admin-ink hover:bg-admin-surface"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Published live-edit info banner (§B.2) */}
      {published && !bannerDismissed ? (
        <div className="flex items-center justify-between gap-3 border-b border-admin-line bg-admin-surface px-4 py-2 text-[13px] text-admin-text-secondary md:px-6">
          <span>Perubahan tersimpan langsung ke situs.</span>
          <button
            type="button"
            aria-label="Tutup pemberitahuan"
            onClick={() => setBannerDismissed(true)}
            className="rounded p-1 hover:bg-admin-surface-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Writing canvas (§B.3) */}
      <main className="mx-auto w-full max-w-[var(--article-measure)] px-4 pt-6 pb-[40vh] md:px-0 md:pt-12">
        <div className="article-prose">
          <textarea
            ref={titleRef}
            rows={1}
            maxLength={MAX_TITLE_INPUT}
            value={title}
            placeholder="Judul"
            aria-label="Judul artikel"
            onChange={(e) => {
              const singleLine = e.target.value.replace(/[\r\n]+/g, " ");
              setTitle(singleLine);
              if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              markDirty();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                editorHandleRef.current?.focusStart();
              }
            }}
            className="article-title w-full resize-none overflow-hidden border-0 bg-transparent p-0 placeholder:text-[#47607D]/45 focus:outline-none"
          />
          {title.length > 100 ? (
            <p className="mt-1 text-right text-xs tabular-nums text-admin-text-secondary">
              {title.length}/{MAX_TITLE_INPUT}
            </p>
          ) : null}
          {fieldErrors.title ? (
            <p role="alert" className="mt-1.5 text-[13px] font-medium text-admin-rose-ink">
              {fieldErrors.title}
            </p>
          ) : null}
        </div>

        <div id="article-body" className="mt-4">
          <ArticleBlockEditor
            initialBlocks={editorSeed}
            getBlocksRef={getBlocksRef}
            editorHandleRef={editorHandleRef}
            onUploadingChange={setUploadingCount}
            onChange={(nextBlocks) => {
              blocksRef.current = nextBlocks;
              setLiveBlocks(nextBlocks);
              if (fieldErrors.blocks) setFieldErrors((prev) => ({ ...prev, blocks: "" }));
              markDirty();
            }}
          />
          {fieldErrors.blocks ? (
            <p role="alert" className="mt-2 text-[13px] font-medium text-admin-rose-ink">
              {fieldErrors.blocks}
            </p>
          ) : null}
          {fieldErrors.alt ? (
            <p role="alert" className="mt-2 text-[13px] font-medium text-admin-rose-ink">
              {fieldErrors.alt}
            </p>
          ) : null}
        </div>
      </main>

      {/* Detail & Thumbnail Panel (§B.5) */}
      {detailOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detail artikel"
          className="fixed inset-0 z-40 flex items-end justify-end bg-black/30 md:items-stretch"
          onClick={() => setDetailOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setDetailOpen(false);
          }}
        >
          <aside
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border-t border-admin-line bg-admin-canvas p-5 shadow-xl md:max-h-none md:w-[360px] md:rounded-none md:border-l md:border-t-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-admin-line md:hidden" />
            <div className="flex items-center justify-between border-b border-admin-line pb-3">
              <h2 className="text-base font-semibold text-admin-ink">Detail artikel</h2>
              <button
                type="button"
                aria-label="Tutup panel detail"
                onClick={() => setDetailOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-admin-text-secondary hover:bg-admin-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-6">
              {/* 1. Thumbnail */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-secondary">
                  Thumbnail indeks (opsional)
                </p>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void handleThumbnailUpload(file);
                  }}
                />

                {thumbnailUrl ? (
                  <div className="mt-2 space-y-2">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-md border border-admin-line bg-admin-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={thumbUploading}
                        onClick={() => thumbInputRef.current?.click()}
                        className="min-h-[36px] rounded-md border border-admin-line px-3 text-xs font-medium text-admin-ink hover:bg-admin-surface"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        disabled={thumbUploading}
                        onClick={() => {
                          setThumbnailImageId(null);
                          markDirty();
                        }}
                        className="min-h-[36px] rounded-md px-3 text-xs font-medium text-admin-rose-ink hover:bg-admin-rose-soft/30"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) void handleThumbnailUpload(file);
                    }}
                    onClick={() => thumbInputRef.current?.click()}
                    className="mt-2 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-admin-line bg-admin-surface/60 p-4 text-center hover:bg-admin-surface"
                  >
                    <ImageIcon className="h-6 w-6 text-admin-text-secondary" aria-hidden="true" />
                    <span className="text-xs font-medium text-admin-ink">
                      {thumbUploading ? "Mengoptimalkan thumbnail…" : "Pilih gambar untuk daftar artikel"}
                    </span>
                    <span className="text-[11px] text-admin-text-secondary">JPEG, PNG, atau WebP. Maks. 10 MB.</span>
                  </div>
                )}
                {thumbError ? (
                  <p role="alert" className="mt-1.5 text-xs text-admin-rose-ink">
                    {thumbError}
                  </p>
                ) : null}
              </div>

              {/* 2. Pratinjau di indeks */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-secondary">
                  Pratinjau di indeks
                </p>
                <div className="mt-2 rounded-lg border border-[#D8E4F0] bg-white p-3.5">
                  <p className="text-xs font-medium text-[#47607D]">
                    {formatDateLong(publishedAt) ?? "Hari ini"} · {minutes} menit baca
                  </p>
                  <div className="mt-1.5 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-sans text-sm font-bold leading-snug text-[#10243F]">
                        {title.trim() || "Judul artikel"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#47607D]">
                        {derivedExcerpt || "Ringkasan otomatis dari paragraf pertama."}
                      </p>
                    </div>
                    {thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailUrl}
                        alt=""
                        className="h-[60px] w-[80px] shrink-0 rounded object-cover"
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 3. Ringkasan */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-secondary">Ringkasan</p>
                <p className="mt-1 text-xs text-admin-text-secondary">Diambil otomatis dari paragraf pertama.</p>
                <p className="mt-1.5 rounded-md bg-admin-surface p-2.5 text-xs leading-relaxed text-admin-ink">
                  {derivedExcerpt || "—"}
                </p>
              </div>

              {/* 4. Alamat */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-secondary">Alamat</p>
                {slug ? (
                  <div className="mt-1.5 flex items-center justify-between gap-2 rounded-md border border-admin-line bg-admin-surface px-2.5 py-1.5">
                    <span className="truncate text-xs text-admin-ink">/artikel/{slug}</span>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(`${window.location.origin}/artikel/${slug}`);
                        toast.success("Alamat disalin.");
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium text-admin-ink hover:bg-admin-canvas"
                    >
                      <Copy className="h-3 w-3" aria-hidden="true" />
                      Salin
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-admin-text-secondary">Alamat dibuat saat draf pertama tersimpan.</p>
                )}
              </div>

              {/* 5. Riwayat */}
              <div className="space-y-1 border-t border-admin-line pt-4 text-xs text-admin-text-secondary">
                {publishedAt ? <p>Terbit {formatDateLong(publishedAt)}</p> : null}
                {updatedAt ? <p>Terakhir diubah {formatDateTime(updatedAt)}</p> : null}
                {published && slug ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDetailOpen(false);
                      setUnpublishDialogOpen(true);
                    }}
                    className="mt-3 block text-left text-xs font-medium text-admin-rose-ink hover:underline"
                  >
                    Tarik dari publik
                  </button>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Mobile More Actions Sheet (§B.2) */}
      {mobileActionsOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Aksi lain"
          className="fixed inset-0 z-40 flex items-end bg-black/40 md:hidden"
          onClick={() => setMobileActionsOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl border-t border-admin-line bg-admin-canvas p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-admin-line" />
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setMobileActionsOpen(false);
                  setDetailOpen(true);
                }}
                className="flex min-h-[44px] w-full items-center rounded-md px-3 text-left text-sm font-medium text-admin-ink hover:bg-admin-surface"
              >
                Detail &amp; thumbnail
              </button>
              {!published ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileActionsOpen(false);
                    void save(false, false);
                  }}
                  className="flex min-h-[44px] w-full items-center rounded-md px-3 text-left text-sm font-medium text-admin-ink hover:bg-admin-surface"
                >
                  Simpan draf
                </button>
              ) : null}
              {published && slug ? (
                <>
                  <Link
                    href={`/artikel/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileActionsOpen(false)}
                    className="flex min-h-[44px] w-full items-center rounded-md px-3 text-left text-sm font-medium text-admin-ink hover:bg-admin-surface"
                  >
                    Lihat publik
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileActionsOpen(false);
                      setUnpublishDialogOpen(true);
                    }}
                    className="flex min-h-[44px] w-full items-center rounded-md px-3 text-left text-sm font-medium text-admin-rose-ink hover:bg-admin-surface"
                  >
                    Tarik dari publik
                  </button>
                </>
              ) : null}
              {slug && isSuperAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileActionsOpen(false);
                    setDeleteDialogOpen(true);
                  }}
                  className="flex min-h-[44px] w-full items-center rounded-md px-3 text-left text-sm font-medium text-admin-rose-ink hover:bg-admin-surface"
                >
                  Hapus
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Publish / Update Dialog (§B.7) */}
      {publishDialogOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={published ? "Perbarui artikel terbit?" : "Terbitkan artikel?"}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setPublishDialogOpen(false);
          }}
        >
          <div className="w-full max-w-[560px] rounded-t-2xl border border-admin-line bg-admin-canvas p-5 shadow-xl md:rounded-xl">
            <h2 className="text-lg font-semibold text-admin-ink">
              {published ? "Perbarui artikel terbit?" : "Terbitkan artikel?"}
            </h2>

            {/* Index preview */}
            <div className="mt-4 rounded-lg border border-[#D8E4F0] bg-white p-4">
              <p className="text-xs font-medium text-[#47607D]">
                {formatDateLong(publishedAt) ?? "Hari ini"} · {minutes} menit baca
              </p>
              <div className="mt-1.5 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-sans text-base font-bold text-[#10243F]">
                    {title.trim() || "Judul artikel"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#47607D]">
                    {derivedExcerpt || "Ringkasan otomatis dari paragraf pertama."}
                  </p>
                </div>
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnailUrl} alt="" className="h-[60px] w-[80px] shrink-0 rounded object-cover" />
                ) : null}
              </div>
            </div>

            {/* Checklist */}
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  {hasTitle ? (
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-admin-rose-ink" aria-hidden="true" />
                  )}
                  <span>Judul terisi</span>
                </span>
                {!hasTitle ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPublishDialogOpen(false);
                      titleRef.current?.focus();
                    }}
                    className="text-xs font-medium text-[#26599A] underline"
                  >
                    Perbaiki
                  </button>
                ) : null}
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  {hasBody ? (
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-admin-rose-ink" aria-hidden="true" />
                  )}
                  <span>Isi terisi</span>
                </span>
                {!hasBody ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPublishDialogOpen(false);
                      editorHandleRef.current?.focusStart();
                    }}
                    className="text-xs font-medium text-[#26599A] underline"
                  >
                    Perbaiki
                  </button>
                ) : null}
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  {!missingAlt ? (
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-admin-rose-ink" aria-hidden="true" />
                  )}
                  <span>Semua gambar punya teks alternatif</span>
                </span>
                {missingAlt ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPublishDialogOpen(false);
                      editorHandleRef.current?.focusFirstMissingAlt();
                    }}
                    className="text-xs font-medium text-[#26599A] underline"
                  >
                    Perbaiki
                  </button>
                ) : null}
              </li>
              <li className="flex items-center justify-between gap-2 text-admin-text-secondary">
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-admin-text-secondary" aria-hidden="true" />
                  <span>Thumbnail indeks</span>
                </span>
                <span className="text-xs">Opsional</span>
              </li>
            </ul>

            <p className="mt-4 rounded-md bg-admin-surface p-2.5 text-xs text-admin-text-secondary">
              Tips: gunakan judul yang spesifik dan pastikan paragraf pembuka merangkum topik artikel.
            </p>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setPublishDialogOpen(false)}
                className="min-h-[40px] rounded-md border border-admin-line px-4 text-sm font-medium text-admin-ink hover:bg-admin-surface"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!readyToPublish || saving}
                onClick={async () => {
                  const ok = await save(true, false);
                  if (ok) setPublishDialogOpen(false);
                }}
                className="min-h-[40px] rounded-md bg-admin-ink px-4 text-sm font-medium text-admin-on-ink disabled:opacity-50"
              >
                {published ? "Perbarui sekarang" : "Terbitkan sekarang"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Unpublish Dialog (§B.7) */}
      {unpublishDialogOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tarik artikel dari publik?"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setUnpublishDialogOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-admin-line bg-admin-canvas p-5 shadow-xl">
            <h2 className="text-base font-semibold text-admin-ink">Tarik artikel dari publik?</h2>
            <p className="mt-2 text-sm text-admin-text-secondary">
              Artikel kembali menjadi draf dan alamatnya tidak dapat dibuka pengunjung. Isi tidak dihapus.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setUnpublishDialogOpen(false)}
                className="min-h-[40px] rounded-md border border-admin-line px-4 text-sm font-medium text-admin-ink hover:bg-admin-surface"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleUnpublish()}
                className="min-h-[40px] rounded-md bg-admin-rose-soft px-4 text-sm font-medium text-admin-rose-ink hover:opacity-90"
              >
                Tarik dari publik
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Dialog (§B.7) */}
      {deleteDialogOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Hapus artikel ini?"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setDeleteDialogOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-admin-line bg-admin-canvas p-5 shadow-xl">
            <h2 className="text-base font-semibold text-admin-ink">Hapus artikel ini?</h2>
            <p className="mt-2 text-sm text-admin-text-secondary">
              Artikel dan gambarnya dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setDeleteDialogOpen(false)}
                className="min-h-[40px] rounded-md border border-admin-line px-4 text-sm font-medium text-admin-ink hover:bg-admin-surface"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleDelete()}
                className="min-h-[40px] rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
              >
                Hapus permanen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Leave unsaved Dialog (§B.8) */}
      {leaveDialogOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Perubahan belum tersimpan"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setLeaveDialogOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-admin-line bg-admin-canvas p-5 shadow-xl">
            <h2 className="text-base font-semibold text-admin-ink">Perubahan belum tersimpan</h2>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setLeaveDialogOpen(false)}
                className="min-h-[40px] rounded-md border border-admin-line px-4 text-sm font-medium text-admin-ink hover:bg-admin-surface"
              >
                Tetap di sini
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirty(false);
                  router.push("/admin/artikel");
                }}
                className="min-h-[40px] rounded-md border border-admin-line px-4 text-sm font-medium text-admin-rose-ink hover:bg-admin-surface"
              >
                Keluar tanpa menyimpan
              </button>
              <button
                type="button"
                onClick={async () => {
                  const ok = await save(published, false);
                  if (ok) router.push("/admin/artikel");
                  else setLeaveDialogOpen(false);
                }}
                className="min-h-[40px] rounded-md bg-admin-ink px-4 text-sm font-medium text-admin-on-ink"
              >
                Simpan lalu keluar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
