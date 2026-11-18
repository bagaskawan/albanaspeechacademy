"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import type { HomeMedia } from "@/lib/home-data";

/** Video kelas selebar seksi sebagai jeda antarprogram; iframe baru dimuat saat diputar. */
export function VideoBreak({ video, programTitle }: { video: HomeMedia; programTitle: string }) {
  const [playing, setPlaying] = useState(false);
  const canPlay = Boolean(video.src);

  return (
    <figure className="py-12 lg:py-16">
      <div data-motion="media" className="relative aspect-video overflow-hidden rounded-xs bg-[var(--tone-tile)] lg:aspect-[21/9]">
        {playing && canPlay ? (
          <iframe
            src={`${video.src}${video.src.includes("?") ? "&" : "?"}autoplay=1`}
            title={video.alt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            disabled={!canPlay}
            onClick={() => setPlaying(true)}
            aria-label={canPlay ? `Putar video: ${video.alt}` : video.alt}
            className="group absolute inset-0 cursor-pointer disabled:cursor-default"
          >
            {video.poster ? (
              <Image fill src={video.poster} alt="" sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover hover-zoom" />
            ) : null}
            <span aria-hidden="true" className="absolute inset-0 bg-[rgb(7_15_28/0.25)]" />
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xs bg-[var(--tone-sun)] text-[var(--tone-on-sun)] transition-transform group-hover:scale-105"
            >
              <Play className="size-7 translate-x-0.5 fill-current" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="type-label text-[var(--tone-muted)]">Video kelas · {programTitle}</span>
        <span className="type-small text-[var(--tone-muted)]">{video.alt}</span>
      </figcaption>
    </figure>
  );
}
