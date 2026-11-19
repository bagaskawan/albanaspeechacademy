"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { HomeMedia } from "@/lib/home-data";
import { SkeletonImage } from "./skeleton-image";

/** Video kelas selebar seksi sebagai jeda antarprogram; membuka modal saat diputar. */
export function VideoBreak({ video, programTitle }: { video: HomeMedia; programTitle: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const canPlay = Boolean(video.src);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

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

      <dialog
        ref={dialogRef}
        aria-label={`Video kelas ${programTitle}`}
        className="tone-canvas m-auto max-h-screen w-full max-w-5xl overflow-y-auto rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-0 text-[var(--tone-ink)] backdrop:bg-ink/75"
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
      >
        {open && canPlay ? (
          <div>
            <div className="bg-[var(--tone-tile)]">
              <iframe
                src={`${video.src}${video.src.includes("?") ? "&" : "?"}autoplay=1&rel=0&playsinline=1&iv_load_policy=3`}
                title={video.alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full border-0"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--tone-rule)] p-4 md:p-6">
              <p className="type-small min-w-0 flex-1 text-[var(--tone-muted)]">
                <span className="mr-2 font-semibold text-[var(--tone-ink)]">Video kelas · {programTitle}</span>
                {video.alt}
              </p>
              <button type="button" className="button-primary shrink-0 cursor-pointer" onClick={() => setOpen(false)}>
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </figure>
  );
}
