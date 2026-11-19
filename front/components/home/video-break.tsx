"use client";

import { Play } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { HomeMedia } from "@/lib/home-data";
import { SkeletonImage } from "./skeleton-image";
import { MediaModal } from "./ui/media-modal";

/** Video kelas selebar seksi sebagai jeda antarprogram; membuka modal saat diputar. */
export function VideoBreak({ video, programTitle }: { video: HomeMedia; programTitle: string }) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const canPlay = Boolean(video.src);
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <figure className="py-12 lg:py-16">
      <div data-motion="media" className="relative aspect-video overflow-hidden rounded-xs bg-[var(--tone-tile)] lg:aspect-[21/9]">
        <button
          type="button"
          disabled={!canPlay}
          onClick={(event) => {
            triggerRef.current = event.currentTarget;
            setOpen(true);
          }}
          aria-haspopup="dialog"
          aria-label={canPlay ? `Putar video: ${video.alt}` : video.alt}
          className="group absolute inset-0 cursor-pointer disabled:cursor-default"
        >
          {video.poster ? (
            <SkeletonImage fill src={video.poster} alt="" sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover hover-zoom" />
          ) : null}
          <span aria-hidden="true" className="absolute inset-0 bg-[rgb(7_15_28/0.25)] transition-colors duration-700 ease-out group-hover:bg-[rgb(7_15_28/0.16)] motion-reduce:transition-none" />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xs bg-[var(--tone-sun)] text-[var(--tone-on-sun)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none"
          >
            <Play className="size-7 translate-x-0.5 fill-current" />
          </span>
        </button>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="type-label text-[var(--tone-muted)]">Video kelas · {programTitle}</span>
        <span className="type-small text-[var(--tone-muted)]">{video.alt}</span>
      </figcaption>

      <MediaModal
        open={open && canPlay}
        onClose={closeModal}
        ariaLabel={`Video kelas ${programTitle}`}
        returnFocusTo={triggerRef}
        headerLeft={
          <span className="type-small truncate font-semibold text-[var(--tone-ink)]">
            Video kelas · {programTitle}
          </span>
        }
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="type-small line-clamp-2 min-w-0 flex-1 break-words text-[var(--tone-muted)]">
              {video.alt}
            </p>
            <button
              type="button"
              className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-none border border-[var(--tone-accent)] bg-[var(--tone-accent)] px-5 text-sm font-semibold text-[var(--tone-bg)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] sm:rounded-xs"
              onClick={closeModal}
            >
              Tutup
            </button>
          </div>
        }
      >
        <iframe
          src={`${video.src}${video.src.includes("?") ? "&" : "?"}autoplay=1&rel=0&playsinline=1&iv_load_policy=3`}
          title={video.alt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full border-0"
        />
      </MediaModal>
    </figure>
  );
}
