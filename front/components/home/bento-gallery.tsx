"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { bentoLayout } from "@/lib/bento";
import type { HomeMedia } from "@/lib/home-data";

function tileSizes(className: string): string {
  if (className.includes("lg:col-span-4")) return "(min-width:1024px) 58vw, 100vw";
  if (className.includes("lg:col-span-2")) return "(min-width:1024px) 34vw, 100vw";
  return "(min-width:1024px) 17vw, 50vw";
}

export function BentoGallery({ media, label }: { media: HomeMedia[]; label: string }) {
  const { tiles, ordered, rest } = bentoLayout(media);
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
        className="grid grid-cols-2 auto-rows-[9rem] gap-1 lg:grid-cols-4 lg:auto-rows-[11rem]"
      >
        {tiles.map((tile, index) => {
          const item = tile.media;
          const sizes = tileSizes(tile.className);
          return (
            <li
              key={item.id}
              data-motion="media"
              className={`overflow-hidden bg-[var(--tone-tile)] ${tile.className}`}
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
                        sizes={sizes}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    >
                      <span className="flex size-12 items-center justify-center bg-black/70 text-white">
                        <Play className="size-5 translate-x-0.5 fill-current" />
                      </span>
                    </span>
                  </>
                ) : (
                  <Image
                    fill
                    src={item.src}
                    alt={item.alt}
                    sizes={sizes}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {rest > 0 ? (
        <div className="mt-3">
          <button
            type="button"
            className="inline-flex min-h-10 cursor-pointer items-center font-display text-sm font-semibold text-[var(--tone-ink)] underline underline-offset-4 transition-colors hover:text-[var(--tone-accent)]"
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setActiveIndex(tiles.length);
            }}
          >
            Lihat semua dokumentasi ({total})
          </button>
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-label={label}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(72rem,calc(100vw-2rem))] tone-canvas overflow-y-auto border border-[var(--tone-rule)] p-0 backdrop:bg-black/75"
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
                <div className="relative h-[min(70dvh,42rem)] w-full">
                  <Image
                    fill
                    src={active.src}
                    alt={active.alt}
                    sizes="(min-width:1024px) 72rem, 100vw"
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--tone-rule)] p-4 md:p-5">
              <p className="min-w-0 flex-1 text-sm text-[var(--tone-muted)]">
                <span className="mr-2 font-semibold tabular-nums text-[var(--tone-ink)]">
                  {activeIndex + 1}/{total}
                </span>
                {active.alt}
              </p>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {total > 1 ? (
                  <>
                    <button
                      type="button"
                      className="inline-flex min-h-10 cursor-pointer items-center button-secondary text-xs"
                      onClick={showPrevious}
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-10 cursor-pointer items-center button-secondary text-xs"
                      onClick={showNext}
                    >
                      Berikutnya
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className="inline-flex min-h-10 cursor-pointer items-center button-primary text-xs"
                  onClick={() => setActiveIndex(null)}
                >
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
