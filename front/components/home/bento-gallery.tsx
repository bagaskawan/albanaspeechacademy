"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { bentoLayout, mosaicLayout } from "@/lib/bento";
import type { HomeMedia } from "@/lib/home-data";
import { SkeletonImage } from "./skeleton-image";
import { Accent } from "./ui/accent";
import { MediaModal } from "./ui/media-modal";

// Galeri kecil (1–3 foto) memenuhi satu baris penuh agar tidak bolong.
const FEW_COLUMNS: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };

// Penempatan kolase editorial 3 kolom tanpa kotak latar, mengikuti ritme foto bertingkat.
const EDITORIAL_LIMIT = 10;

type EditorialTileProps = {
  item: HomeMedia;
  index: number;
  aspectClass: string;
  objectPosition: string;
  sizes: string;
  onOpen: (index: number, button: HTMLButtonElement) => void;
  onOrientation: (id: number, img: HTMLImageElement) => void;
};

function EditorialTile({
  item,
  index,
  aspectClass,
  objectPosition,
  sizes,
  onOpen,
  onOrientation,
}: EditorialTileProps) {
  return (
    <div
      data-motion="media"
      className={`overflow-hidden rounded-xs bg-[var(--tone-tile)] ${aspectClass}`}
    >
      <button
        type="button"
        aria-label={`Perbesar: ${item.alt}`}
        aria-haspopup="dialog"
        className="group relative block size-full cursor-pointer overflow-hidden"
        onClick={(event) => onOpen(index, event.currentTarget)}
      >
        {item.kind === "video" ? (
          <>
            {item.poster ? (
              <SkeletonImage
                fill
                src={item.poster}
                alt={item.alt}
                quality={85}
                sizes={sizes}
                onLoad={(e) => onOrientation(item.id, e.currentTarget)}
                className={`object-cover ${objectPosition} hover-zoom`}
              />
            ) : null}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <span className="flex size-10 items-center justify-center rounded-xs bg-ink/85 text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none">
                <Play className="size-4 translate-x-0.5 fill-current" />
              </span>
            </span>
          </>
        ) : (
          <SkeletonImage
            fill
            src={item.src}
            alt={item.alt}
            quality={85}
            sizes={sizes}
            blurDataURL={item.blurDataURL ?? undefined}
            onLoad={(e) => onOrientation(item.id, e.currentTarget)}
            className={`object-cover ${objectPosition} hover-zoom`}
          />
        )}
      </button>
    </div>
  );
}

export function BentoGallery({
  media,
  label,
  variant = "grid",
  editorialTitle,
}: {
  media: HomeMedia[];
  label: string;
  /** mosaic: pola 10/8/4 petak; editorial: kolase 3 kolom tanpa kotak latar. */
  variant?: "grid" | "mosaic" | "editorial";
  editorialTitle?: string;
}) {
  const isEditorial = variant === "editorial";
  const baseLayout = variant === "mosaic" ? mosaicLayout(media) : bentoLayout(media);
  const tiles = isEditorial ? baseLayout.tiles.slice(0, EDITORIAL_LIMIT) : baseLayout.tiles;
  const ordered = baseLayout.ordered;
  const rest = isEditorial ? Math.max(0, ordered.length - tiles.length) : baseLayout.rest;
  const mosaic = variant === "mosaic" && tiles[0]?.className !== "aspect-[4/3]";
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [orientations, setOrientations] = useState<Record<number, "portrait" | "landscape">>({});

  function recordOrientation(id: number, img: HTMLImageElement) {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const next = img.naturalHeight > img.naturalWidth ? "portrait" : "landscape";
    setOrientations((prev) => (prev[id] === next ? prev : { ...prev, [id]: next }));
  }

  const total = ordered.length;
  const isOpen = activeIndex !== null && Boolean(ordered[activeIndex]);

  const closeModal = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    setDirection(-1);
    setActiveIndex((current) => (current === null ? null : (current - 1 + total) % total));
  }, [total]);

  const showNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((current) => (current === null ? null : (current + 1) % total));
  }, [total]);

  const handleModalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (total <= 1) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    },
    [total, showPrevious, showNext]
  );

  if (tiles.length === 0) return null;

  const active = activeIndex !== null ? ordered[activeIndex] ?? null : null;

  function openTile(index: number, button: HTMLButtonElement) {
    triggerRef.current = button;
    setDirection(1);
    setActiveIndex(index);
  }

  function objectPosFor(id: number) {
    return orientations[id] === "portrait" ? "object-top" : "object-center";
  }

  return (
    <div>
      {isEditorial ? (
        <div
          data-bento
          role="region"
          aria-label={label}
          className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start md:gap-4 lg:gap-5"
        >
          {/* Kolom kiri: 1 foto bertangga + tipografi editorial + foto pengisi bawah */}
          <div className="flex flex-col gap-5 md:col-span-4 md:mt-12">
            {tiles[0] ? (
              <EditorialTile
                item={tiles[0].media}
                index={0}
                aspectClass="aspect-[3/4]"
                objectPosition={objectPosFor(tiles[0].media.id)}
                sizes="(min-width: 768px) 30vw, 100vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}

            <div className="flex flex-col items-start gap-3 py-2 md:py-6">
              <p className="type-display text-[var(--tone-accent)] text-balance">
                Galeri <Accent>{editorialTitle ?? label}</Accent>
              </p>
              <p className="type-small max-w-[30ch] uppercase tracking-wider text-[var(--tone-accent)]/85">
                Suasana latihan panggung, simulasi presentasi, dan masukan langsung di setiap sesi kelas.
              </p>
            </div>

            {tiles[7] ? (
              <EditorialTile
                item={tiles[7].media}
                index={7}
                aspectClass="aspect-[4/3]"
                objectPosition={objectPosFor(tiles[7].media.id)}
                sizes="(min-width: 768px) 30vw, 100vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}
            {tiles[9] ? (
              <EditorialTile
                item={tiles[9].media}
                index={9}
                aspectClass="aspect-[4/3]"
                objectPosition={objectPosFor(tiles[9].media.id)}
                sizes="(min-width: 768px) 30vw, 100vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}
          </div>

          {/* Kolom tengah: 3 foto vertikal berjenjang */}
          <div className="grid grid-cols-2 gap-3 md:col-span-4 md:grid-cols-1 md:gap-4 lg:gap-5">
            {tiles[1] ? (
              <EditorialTile
                item={tiles[1].media}
                index={1}
                aspectClass="aspect-[2/3]"
                objectPosition={objectPosFor(tiles[1].media.id)}
                sizes="(min-width: 768px) 30vw, 50vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}
            {tiles[2] ? (
              <EditorialTile
                item={tiles[2].media}
                index={2}
                aspectClass="aspect-[3/4]"
                objectPosition={objectPosFor(tiles[2].media.id)}
                sizes="(min-width: 768px) 30vw, 50vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}
            {tiles[8] ? (
              <EditorialTile
                item={tiles[8].media}
                index={8}
                aspectClass="aspect-square"
                objectPosition={objectPosFor(tiles[8].media.id)}
                sizes="(min-width: 768px) 30vw, 50vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}
          </div>

          {/* Kolom kanan: 4 foto ritme variatif */}
          <div className="grid grid-cols-2 gap-3 md:col-span-4 md:mt-6 md:grid-cols-1 md:gap-4 lg:gap-5">
            {tiles[3] ? (
              <EditorialTile
                item={tiles[3].media}
                index={3}
                aspectClass="aspect-square md:w-3/4"
                objectPosition={objectPosFor(tiles[3].media.id)}
                sizes="(min-width: 768px) 22vw, 50vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}
            {tiles[4] ? (
              <EditorialTile
                item={tiles[4].media}
                index={4}
                aspectClass="aspect-[3/4]"
                objectPosition={objectPosFor(tiles[4].media.id)}
                sizes="(min-width: 768px) 30vw, 50vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}
            {tiles[5] ? (
              <EditorialTile
                item={tiles[5].media}
                index={5}
                aspectClass="aspect-[4/3]"
                objectPosition={objectPosFor(tiles[5].media.id)}
                sizes="(min-width: 768px) 30vw, 50vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}
            {tiles[6] ? (
              <EditorialTile
                item={tiles[6].media}
                index={6}
                aspectClass="aspect-square"
                objectPosition={objectPosFor(tiles[6].media.id)}
                sizes="(min-width: 768px) 30vw, 50vw"
                onOpen={openTile}
                onOrientation={recordOrientation}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <>
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
              const orientation = orientations[item.id];
              const tileClass = !mosaic && orientation === "portrait" ? "aspect-[3/4]" : tile.className;
              const objectPosition = orientation === "portrait" ? "object-top" : "object-center";
              return (
                <li
                  key={item.id}
                  data-motion="media"
                  className={`overflow-hidden rounded-xs bg-[var(--tone-tile)] ${tileClass}`}
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
                          <SkeletonImage
                            fill
                            src={item.poster}
                            alt={item.alt}
                            quality={85}
                            sizes="(min-width:1024px) 40vw, 100vw"
                            onLoad={(e) => recordOrientation(item.id, e.currentTarget)}
                            className={`object-cover ${objectPosition} hover-zoom`}
                          />
                        ) : null}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        >
                          <span className="flex size-10 items-center justify-center rounded-xs bg-ink/85 text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none">
                            <Play className="size-4 translate-x-0.5 fill-current" />
                          </span>
                        </span>
                      </>
                    ) : (
                      <SkeletonImage
                        fill
                        src={item.src}
                        alt={item.alt}
                        quality={85}
                        sizes="(min-width:1024px) 40vw, 100vw"
                        onLoad={(e) => recordOrientation(item.id, e.currentTarget)}
                        className={`object-cover ${objectPosition} hover-zoom`}
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
        </>
      )}

      <MediaModal
        open={isOpen}
        onClose={closeModal}
        ariaLabel={label}
        onKeyDown={handleModalKeyDown}
        returnFocusTo={triggerRef}
        headerLeft={
          active && activeIndex !== null ? (
            <>
              <span className="shrink-0 text-xs font-semibold tabular-nums tracking-wider text-[var(--tone-accent)]">
                {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <span className="h-3.5 w-px shrink-0 bg-[var(--tone-rule)]" aria-hidden="true" />
              <span className="type-small truncate text-[var(--tone-muted)]">{label}</span>
            </>
          ) : null
        }
        footer={
          active ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="type-small line-clamp-2 min-w-0 flex-1 break-words text-[var(--tone-muted)]">
                {active.alt}
              </p>

              {total > 1 ? (
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:items-center">
                  <button
                    type="button"
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[var(--tone-rule)] bg-[var(--tone-tile)] px-4 text-sm font-semibold text-[var(--tone-ink)] transition-colors hover:border-[var(--tone-accent)] hover:text-[var(--tone-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] sm:rounded-xs"
                    onClick={showPrevious}
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    <span>Sebelumnya</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[var(--tone-accent)] bg-[var(--tone-accent)] px-4 text-sm font-semibold text-[var(--tone-bg)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] sm:rounded-xs"
                    onClick={showNext}
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null
        }
      >
        {active && activeIndex !== null ? (
          <div
            className="relative w-full"
            onTouchStart={(event) => {
              touchStartX.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              if (total <= 1 || touchStartX.current === null) return;
              const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
              const deltaX = endX - touchStartX.current;
              touchStartX.current = null;
              if (deltaX > 40) showPrevious();
              else if (deltaX < -40) showNext();
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={active.id ?? activeIndex}
                initial={{ opacity: 0, x: direction * 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -28 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {active.kind === "video" ? (
                  active.src ? (
                    <iframe
                      src={`${active.src}${active.src.includes("?") ? "&" : "?"}rel=0&playsinline=1&iv_load_policy=3`}
                      title={active.alt}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video w-full border-0"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center p-8 text-center text-sm text-white/75">
                      {active.alt}
                    </div>
                  )
                ) : (
                  <div className="relative aspect-[4/3] w-full sm:aspect-video">
                    <SkeletonImage
                      fill
                      src={active.src}
                      alt={active.alt}
                      quality={90}
                      sizes="(min-width:1024px) 56rem, 100vw"
                      className="object-contain"
                    />
                  </div>
                )}
              </m.div>
            </AnimatePresence>

            {total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Foto sebelumnya"
                  className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xs border border-white/15 bg-[#070f1c]/70 text-white backdrop-blur-xs transition-colors hover:bg-[#070f1c]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Foto berikutnya"
                  className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xs border border-white/15 bg-[#070f1c]/70 text-white backdrop-blur-xs transition-colors hover:bg-[#070f1c]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </MediaModal>
    </div>
  );
}
