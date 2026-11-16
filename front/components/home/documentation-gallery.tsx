"use client";

import { useEffect, useRef, useState } from "react";

export type DocumentationItem = {
  id: number;
  image_url: string;
  title: string | null;
};

/**
 * Natural image ratio keeps portrait photos tall and landscape photos wide,
 * so the masonry columns show each photo in its own orientation.
 */
export function DocumentationGallery({ items, preview = false }: { items: DocumentationItem[]; preview?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<DocumentationItem | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  return (
    <>
      {preview ? <p className="mt-8 text-sm font-semibold text-muted">Contoh visual — bukan dokumentasi kelas Albana</p> : null}
      <ul className="mt-4 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item) => {
          const label = `${item.title ?? "Dokumentasi kelas Albana"}${preview ? "; bukan dokumentasi kelas Albana" : ""}`;
          return (
            <li key={item.id} className="mb-4 break-inside-avoid">
              <figure className="overflow-hidden rounded-card border border-rule bg-card">
                <button
                  type="button"
                  aria-label={`Perbesar foto: ${label}`}
                  aria-haspopup="dialog"
                  className="group block w-full cursor-pointer overflow-hidden bg-panel-soft"
                  onClick={(event) => {
                    triggerRef.current = event.currentTarget;
                    setSelected(item);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={label}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                  />
                </button>
              </figure>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Dokumentasi kelas"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(72rem,calc(100vw-2rem))] overflow-y-auto border border-rule bg-card p-0 text-ink backdrop:bg-ink/70"
        onClick={(event) => {
          if (event.target === dialogRef.current) setSelected(null);
        }}
        onClose={() => {
          setSelected(null);
          triggerRef.current?.focus();
        }}
      >
        {selected ? (
          <div>
            <div className="relative bg-panel-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.image_url}
                alt={selected.title ?? "Dokumentasi kelas Albana"}
                className="mx-auto block h-auto max-h-[calc(100dvh-8rem)] w-auto max-w-full"
              />
              <button
                type="button"
                aria-label="Tutup"
                className="absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center bg-canvas text-2xl leading-none text-ink hover:text-accent"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>
            {selected.title ? (
              <div className="border-t border-rule p-4 md:p-5">
                <h3 className="flex items-center gap-2 font-semibold">
                  <span aria-hidden="true" className="size-1.5 shrink-0 bg-accent" />
                  {preview ? `${selected.title} — bukan dokumentasi kelas Albana` : selected.title}
                </h3>
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
