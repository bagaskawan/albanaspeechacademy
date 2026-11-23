"use client";

import { Expand } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SkeletonImage } from "./skeleton-image";
import { MediaModal } from "./ui/media-modal";

export function ScheduleThumb({
  src,
  alt,
  title,
  isFlyer,
}: {
  src: string;
  alt: string;
  title: string;
  isFlyer: boolean;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const closeModal = useCallback(() => setOpen(false), []);

  if (!isFlyer) {
    return (
      <div
        data-motion="media"
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xs bg-[var(--tone-bg)] sm:aspect-video lg:aspect-[4/3]"
      >
        <SkeletonImage
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 18rem, 90vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <>
      <div
        data-motion="media"
        className="relative mx-auto aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] lg:max-w-none"
      >
        <button
          type="button"
          onClick={(event) => {
            triggerRef.current = event.currentTarget;
            setOpen(true);
          }}
          aria-haspopup="dialog"
          aria-label={`Perbesar flyer ${title}`}
          className="group relative block size-full cursor-pointer"
        >
          <SkeletonImage
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 18rem, 260px"
            className="object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 bottom-2 inline-flex size-8 items-center justify-center rounded-xs bg-ink/75 text-white opacity-90 transition-opacity group-hover:opacity-100"
          >
            <Expand className="size-4" />
          </span>
        </button>
      </div>

      <MediaModal
        open={open}
        onClose={closeModal}
        ariaLabel={`Flyer ${title}`}
        returnFocusTo={triggerRef}
        headerLeft={
          <span className="type-small truncate font-semibold text-[var(--tone-ink)]">
            Flyer · {title}
          </span>
        }
        footer={
          <div className="flex justify-end">
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
        <div className="relative mx-auto aspect-[4/5] max-h-[75dvh] w-full max-w-lg bg-black/20">
          <SkeletonImage
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 768px) 32rem, 95vw"
            className="object-contain"
          />
        </div>
      </MediaModal>
    </>
  );
}
