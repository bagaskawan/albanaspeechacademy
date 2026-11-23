"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { DeleteSheet } from "@/components/admin/ui/delete-sheet";

export function MobileArticleRowActions({
  slug,
  title,
  published,
  onDelete,
}: {
  slug: string;
  title: string;
  published: boolean;
  onDelete: () => Promise<{ error?: string }>;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`Aksi untuk ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          setSheetOpen(true);
        }}
        className="relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-admin-text-secondary hover:bg-admin-surface hover:text-admin-ink"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {sheetOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Aksi untuk ${title}`}
          className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl border-t border-admin-line bg-admin-canvas p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-admin-line" />
            <p className="mb-2 truncate px-3 text-xs font-medium text-admin-text-secondary">{title}</p>
            <div className="space-y-1">
              <Link
                href={`/admin/artikel/${slug}`}
                onClick={() => setSheetOpen(false)}
                className="flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-admin-ink hover:bg-admin-surface"
              >
                Ubah
              </Link>
              {published ? (
                <Link
                  href={`/artikel/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSheetOpen(false)}
                  className="flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-admin-ink hover:bg-admin-surface"
                >
                  Lihat publik
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSheetOpen(false);
                  setConfirmDelete(true);
                }}
                className="flex min-h-[44px] w-full items-center rounded-md px-3 text-left text-sm font-medium text-admin-rose-ink hover:bg-admin-surface"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <DeleteSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Hapus ${title}?`}
        successMessage={`${title} dihapus.`}
        onConfirm={onDelete}
      />
    </>
  );
}
