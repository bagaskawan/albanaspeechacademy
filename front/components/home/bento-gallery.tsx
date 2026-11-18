"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { bentoLayout, mosaicLayout } from "@/lib/bento";
import type { HomeMedia } from "@/lib/home-data";

// Galeri kecil (1–3 foto) memenuhi satu baris penuh agar tidak bolong.
const FEW_COLUMNS: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };

export function BentoGallery({
  media,
  label,
  variant = "grid",
}: {
  media: HomeMedia[];
  label: string;
  /** mosaic: pola 10/8/4 petak untuk bab Dokumentasi. */
  variant?: "grid" | "mosaic";
}) {
  const { tiles, ordered, rest } = variant === "mosaic" ? mosaicLayout(media) : bentoLayout(media);
  const mosaic = variant === "mosaic" && tiles[0]?.className !== "aspect-[4/3]";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeIndex !== null && !dialog.open) dialog.showModal();
    if (activeIndex === null && dialog.open) dialog.close();
  }, [activeIndex]);

  if (tiles.length === 0) return null;

  const active = activeIndex !== null ? ordered[activeIndex] ?? null : null;
  const total = ordered.length;

  function showPrevious() {
    setActiveIndex((current) => (current === null ? null : (current - 1 + total) % total));
  }

  function showNext() {
    setActiveIndex((current) => (current === null ? null : (current + 1) % total));
  }

  return (
    <div>
      <ul
        data-bento
        aria-label={label}
        className={
          mosaic
            ? "grid grid-flow-dense auto-rows-[9rem] grid-cols-2 gap-2 sm:auto-rows-[12rem] lg:grid-cols-4 lg:auto-rows-[13rem]"
            : `grid gap-1 ${FEW_COLUMNS[tiles.length] ?? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`
        }
      >
        {tiles.map((tile, index) => {
          const item = tile.media;
          return (
            <li
              key={item.id}
              data-motion="media"
              className={`overflow-hidden rounded-xs bg-[var(--tone-tile)] ${tile.className}`}
            >
              <button
                type="button"
                aria-label={`Perbesar: ${item.alt}`}
                aria-haspopup="dialog"
                className="group relative block size-full cursor-pointer overflow-hidden"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setActiveIndex(index);
                }}
              >
                {item.kind === "video" ? (
                  <>
                    {item.poster ? (
                      <Image
                        fill
                        src={item.poster}
                        alt={item.alt}
                        quality={85}
                        sizes="(min-width:1024px) 40vw, 100vw"
                        className="object-cover hover-zoom"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    >
                      <span className="flex size-10 items-center justify-center rounded-xs bg-ink/85 text-white">
                        <Play className="size-4 translate-x-0.5 fill-current" />
                      </span>
                    </span>
                  </>
                ) : (
                  <Image
                    fill
                    src={item.src}
                    alt={item.alt}
                    quality={85}
                    sizes="(min-width:1024px) 40vw, 100vw"
                    className="object-cover hover-zoom"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {rest > 0 ? (
        <button
          type="button"
          aria-haspopup="dialog"
          className="type-small mt-4 inline-flex min-h-11 cursor-pointer items-center font-medium underline underline-offset-4"
          onClick={(event) => {
            triggerRef.current = event.currentTarget;
            setActiveIndex(tiles.length);
          }}
        >
          Lihat semua dokumentasi ({total})
        </button>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-label={label}
        className="tone-canvas m-auto max-h-screen w-full max-w-5xl overflow-y-auto rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-0 text-[var(--tone-ink)] backdrop:bg-ink/75"
        onClick={(event) => {
          if (event.target === dialogRef.current) setActiveIndex(null);
        }}
        onClose={() => {
          setActiveIndex(null);
          triggerRef.current?.focus();
        }}
        onKeyDown={(event) => {
          if (total <= 1) return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            showPrevious();
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            showNext();
          }
        }}
      >
        {active && activeIndex !== null ? (
          <div>
            <div className="bg-[var(--tone-tile)]">
              {active.kind === "video" ? (
                active.src ? (
                  <iframe
                    src={active.src}
                    title={active.alt}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full border-0"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center p-8 text-center text-sm text-[var(--tone-muted)]">
                    {active.alt}
                  </div>
                )
              ) : (
                <div className="relative aspect-video w-full">
                  <Image
                    fill
                    src={active.src}
                    alt={active.alt}
                    quality={90}
                    sizes="(min-width:1024px) 64rem, 100vw"
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--tone-rule)] p-4 md:p-6">
              <p className="type-small min-w-0 flex-1 text-[var(--tone-muted)]">
                <span className="mr-2 font-semibold tabular-nums text-[var(--tone-ink)]">
                  {activeIndex + 1}/{total}
                </span>
                {active.alt}
              </p>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {total > 1 ? (
                  <>
                    <button type="button" className="button-secondary cursor-pointer" onClick={showPrevious}>
                      Sebelumnya
                    </button>
                    <button type="button" className="button-secondary cursor-pointer" onClick={showNext}>
                      Berikutnya
                    </button>
                  </>
                ) : null}
                <button type="button" className="button-primary cursor-pointer" onClick={() => setActiveIndex(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
