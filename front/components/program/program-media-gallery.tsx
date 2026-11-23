"use client";

import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SkeletonImage } from "@/components/home/skeleton-image";
import { MediaModal } from "@/components/home/ui/media-modal";

export type ProgramGalleryImage = {
  id: number;
  src: string;
  alt: string;
  blurDataURL?: string | null;
};

export function ProgramMediaGallery({
  images,
  programTitle,
}: {
  images: ProgramGalleryImage[];
  programTitle: string;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = images.length;
  const active = activeIndex !== null ? images[activeIndex] ?? null : null;

  const closeModal = useCallback(() => setActiveIndex(null), []);
  const step = useCallback(
    (delta: 1 | -1) => {
      setActiveIndex((prev) => (prev === null || total < 2 ? prev : (prev + delta + total) % total));
    },
    [total],
  );

  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((item, index) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xs border border-rule bg-card dark:border-white/15"
          >
            <button
              type="button"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActiveIndex(index);
              }}
              aria-haspopup="dialog"
              aria-label={`Perbesar dokumentasi: ${item.alt}`}
              className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[var(--tone-tile)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <SkeletonImage
                fill
                src={item.src}
                alt={item.alt}
                blurDataURL={item.blurDataURL ?? undefined}
                sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 95vw"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 bottom-2.5 inline-flex size-8 items-center justify-center rounded-xs bg-ink/75 text-white opacity-85 transition-opacity group-hover:opacity-100"
              >
                <Expand className="size-4" />
              </span>
            </button>
          </div>
        ))}
      </div>

      <MediaModal
        open={Boolean(active)}
        onClose={closeModal}
        ariaLabel={active ? active.alt : `Dokumentasi ${programTitle}`}
        returnFocusTo={triggerRef}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
        headerLeft={
          <span className="type-small truncate font-semibold text-[var(--tone-ink)]">
            Dokumentasi · {programTitle}
          </span>
        }
        footer={
          active ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="type-small line-clamp-2 min-w-0 flex-1 break-words text-[var(--tone-muted)]">
                {active.alt}
              </p>
              <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                {total > 1 ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Foto sebelumnya"
                      className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)] text-[var(--tone-ink)] transition-colors hover:bg-[var(--tone-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)]"
                    >
                      <ChevronLeft className="size-4" aria-hidden="true" />
                    </button>
                    <span className="type-small min-w-12 text-center tabular-nums text-[var(--tone-muted)]">
                      {(activeIndex ?? 0) + 1} / {total}
                    </span>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Foto berikutnya"
                      className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)] text-[var(--tone-ink)] transition-colors hover:bg-[var(--tone-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)]"
                    >
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-none border border-[var(--tone-accent)] bg-[var(--tone-accent)] px-5 text-sm font-semibold text-[var(--tone-bg)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] sm:rounded-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {active ? (
          <div className="relative aspect-[4/3] w-full sm:aspect-video">
            <SkeletonImage
              fill
              src={active.src}
              alt={active.alt}
              blurDataURL={active.blurDataURL ?? undefined}
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="object-contain"
            />
          </div>
        ) : null}
      </MediaModal>
    </>
  );
}
