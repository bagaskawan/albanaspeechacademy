"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogIconHeader } from "@/components/ui/DialogIconHeader";
import {
  articleHasText,
  splitTitleBlock,
  titleBlock,
  type ArticleBlock,
} from "@/lib/article-blocks";
import { saveArticleAction } from "@/lib/actions/article-actions";

const ArticleBlockEditor = dynamic(() => import("./ArticleBlockEditor"), {
  ssr: false,
  loading: () => <p className="py-10 text-xs text-text-secondary">Memuat editor…</p>,
});

const AUTOSAVE_MS = 1500;

export type ArticleEditorData = {
  slug: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  blocks: ArticleBlock[];
};

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

export default function ArticleEditor({ article }: { article: ArticleEditorData | null }) {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(article?.slug ?? null);
  const [published, setPublished] = useState(article?.published ?? false);
  const [publishedAt, setPublishedAt] = useState(article?.publishedAt ?? null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(article?.updatedAt ?? null);
  const [dirty, setDirty] = useState(false);
  const [editSeq, setEditSeq] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editorSeed] = useState<ArticleBlock[]>(() =>
    article ? [titleBlock(article.title), ...article.blocks] : [],
  );
  const blocksRef = useRef<ArticleBlock[]>(editorSeed);
  const getBlocksRef = useRef<(() => ArticleBlock[]) | null>(null);

  /** The editor owns the document while mounted; the ref is the fallback before it mounts. */
  const currentBlocks = () => {
    const live = getBlocksRef.current?.();
    if (live) blocksRef.current = live;
    return blocksRef.current;
  };

  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  const save = async (shouldPublish: boolean, auto: boolean) => {
    const blocks = currentBlocks();
    const split = splitTitleBlock(blocks);
    const localFields: Record<string, string> = {};
    if (!split.title) localFields.title = "Baris pertama menjadi judul artikel. Isi baris pertama.";
    if (!articleHasText(split.blocks)) localFields.blocks = "Isi artikel wajib diisi.";

    if (Object.keys(localFields).length) {
      if (auto) return;
      setFieldErrors(localFields);
      setError("Periksa kembali isian artikel.");
      document.querySelector<HTMLElement>("#article-body .bn-editor")?.focus();
      return;
    }

    setError(null);
    setFieldErrors({});
    setSaving(true);
    try {
      const result = await saveArticleAction({
        slug,
        blocks,
        publish: shouldPublish,
        expectedUpdatedAt: updatedAt,
      });

      if (!result.ok) {
        setError(result.error);
        if (result.fields) setFieldErrors(result.fields);
        return;
      }

      const created = !slug;
      setSlug(result.slug);
      setUpdatedAt(result.updatedAt);
      setPublishedAt(result.publishedAt);
      setPublished(shouldPublish);
      setDirty(false);
      setSavedOnce(true);
      if (shouldPublish && !auto) toast.success("Artikel diterbitkan.");
      if (created) router.replace(`/admin/artikel/${result.slug}`);
    } catch {
      setError("Perubahan artikel gagal disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!dirty || saving) return;
    const id = setTimeout(() => void save(published, true), AUTOSAVE_MS);
    return () => clearTimeout(id);
    // save is intentionally excluded: every edit bumps editSeq and restarts the debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSeq, dirty, saving, published]);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const leaveGuard = (event: React.MouseEvent) => {
    if (dirty) {
      event.preventDefault();
      setShowLeaveConfirm(true);
    }
  };

  const handleConfirmLeave = () => {
    setDirty(false);
    setShowLeaveConfirm(false);
    router.push("/admin/artikel");
  };

  const publishedLabel = formatDate(publishedAt);
  const statusText = saving
    ? "Menyimpan…"
    : error
      ? "Gagal menyimpan"
      : dirty || (!article && !savedOnce)
        ? "Belum tersimpan"
        : "Tersimpan";

  return (
    <div className="w-full pb-28 md:pb-12">
      <div className="flex items-center justify-between gap-4 border-b border-border-default/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/artikel"
            onClick={leaveGuard}
            title="Kembali ke daftar artikel"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-default text-text-secondary transition-colors hover:bg-bg-well hover:text-text-primary"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-text-muted">
              [ ARTIKEL ] / {article ? "Ubah Artikel" : "Tulis Artikel"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 pr-10">
          <p role="status" aria-live="polite" className="text-[10px] font-semibold text-text-secondary">
            {statusText}
          </p>
          {published && publishedLabel && (
            <p className="text-[10px] text-text-muted">Terbit {publishedLabel}</p>
          )}
          {published && slug && (
            <Link
              href={`/artikel/${slug}`}
              target="_blank"
              className="text-[10px] font-semibold text-text-secondary underline underline-offset-4 hover:text-text-primary"
            >
              Lihat publik
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-[#FEE2E2] p-3 text-xs font-semibold text-[#991B1B] dark:bg-[#450A0A] dark:text-[#FECACA]"
        >
          <span>{error}</span>
          {error.includes("tab lain") ? (
            <button type="button" onClick={() => window.location.reload()} className="underline underline-offset-4">
              Muat ulang
            </button>
          ) : (
            <button type="button" onClick={() => save(published, false)} className="underline underline-offset-4">
              Coba lagi
            </button>
          )}
        </div>
      )}

      <div className="mx-auto mt-6 w-full max-w-[78ch]">
        <div id="article-body" aria-label="Isi artikel">
          <ArticleBlockEditor
            initialBlocks={editorSeed}
            getBlocksRef={getBlocksRef}
            onChange={(blocks) => {
              blocksRef.current = blocks;
              setDirty(true);
              setEditSeq((seq) => seq + 1);
            }}
          />
        </div>
        {fieldErrors.title && (
          <p role="alert" className="mt-2 text-xs font-semibold text-destructive">
            {fieldErrors.title}
          </p>
        )}
        {fieldErrors.blocks && (
          <p role="alert" className="mt-1 text-xs font-semibold text-destructive">
            {fieldErrors.blocks}
          </p>
        )}
      </div>

      <Button
        type="button"
        onClick={() => save(true, false)}
        disabled={saving}
        className="fixed bottom-6 right-5 z-40 h-9 rounded-full bg-[#2F5C86] px-4 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#24486A] md:right-8"
      >
        {saving ? "Menyimpan…" : published ? "Perbarui terbitan" : "Terbitkan"}
      </Button>

      {/* Modal Popup Warning Perubahan Belum Tersimpan */}
      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border-0 sm:border border-zinc-200 dark:border-zinc-800 p-6 rounded-none sm:rounded-[24px]">
          <DialogIconHeader
            icon={<AlertTriangle size={18} />}
            title="Perubahan Belum Tersimpan"
            description="Ada perubahan artikel yang belum tersimpan. Tinggalkan halaman ini? Perubahan yang belum disimpan akan hilang."
            tone="amber"
          />

          <div className="flex flex-row justify-end gap-3 pt-4 px-1">
            <Button
              type="button"
              onClick={() => setShowLeaveConfirm(false)}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-full cursor-pointer h-auto shadow-none"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmLeave}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 rounded-full cursor-pointer h-auto border-0 shadow-sm"
            >
              Tinggalkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
