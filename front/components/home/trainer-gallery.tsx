"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SkeletonImage } from "./skeleton-image";

export type Trainer = {
  slug: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
};

const highlights: Record<string, string[]> = {
  "alan-albana": ["Penyiar RRI sejak 2015", "Penulis buku Ice Breaking", "S2 Komunikasi Pendidikan UNISBA"],
  nurachman: ["Public speaking dan grafologi", "Manajemen SDM", "Pemateri perbankan dan universitas"],
  "andhan-indah": ["Female MC of The Year Hipapi Indonesia", "Trainer komunikasi LIPI", "Public Relations UNPAD"],
  "abo-priatna": ["MC acara nasional dan korporat", "Announcer dan podcaster", "Certified Bilingual MC"],
};

const FALLBACK_ALAN = "/images/alan-albana-profile-blue-background.png";

function TrainerPortrait({
  trainer,
  sizes,
  fit = "cover",
}: {
  trainer: Trainer;
  sizes: string;
  fit?: "cover" | "contain";
}) {
  const [src, setSrc] = useState(trainer.image ?? "");
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <SkeletonImage
        src={src}
        alt=""
        fill
        sizes={sizes}
        unoptimized
        onError={() => {
          if (trainer.slug === "alan-albana" && src !== FALLBACK_ALAN) {
            setSrc(FALLBACK_ALAN);
          } else {
            setFailed(true);
          }
        }}
        className={fit === "contain" ? "object-contain" : "hover-zoom object-cover object-[center_30%]"}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="type-display absolute inset-0 grid place-items-center text-[var(--tone-accent)]"
    >
      {trainer.name.split(" ").map((part) => part[0]).join("")}
    </span>
  );
}

export function TrainerGallery({
  trainers,
  intro,
  cta,
}: {
  trainers: Trainer[];
  /** Petak pembuka di sel pertama grid (judul seksi). */
  intro: ReactNode;
  /** Petak ajakan di sel terakhir grid. */
  cta: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedTrainer && !dialog.open) dialog.showModal();
  }, [selectedTrainer]);

  return (
    <div>
      {/* Grid ala Virto: judul di sel pertama, petak ajakan di sel terakhir. */}
      <ul className="grid list-none grid-cols-2 gap-2 lg:grid-cols-3">
        <li className="col-span-2 flex flex-col justify-between gap-6 pb-6 lg:col-span-1 lg:pr-6">{intro}</li>
        {trainers.map((trainer) => (
          <li key={trainer.slug} data-motion="slide">
            <button
              type="button"
              aria-haspopup="dialog"
              className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xs bg-[var(--tone-tile)] text-left"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setSelectedTrainer(trainer);
              }}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--tone-rule)]">
                <TrainerPortrait trainer={trainer} sizes="(min-width: 1024px) 28vw, 45vw" />
              </div>
              <span className="flex flex-1 flex-col gap-1 p-4 sm:p-5">
                <span className="type-title block">{trainer.name}</span>
                <span className="type-small block text-[var(--tone-muted)]">{trainer.role}</span>
                <span className="type-small mt-auto inline-flex min-h-11 items-center gap-1.5 pt-2 font-medium underline-offset-4 group-hover:underline">
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                  <span>Lihat profil</span>
                </span>
              </span>
            </button>
          </li>
        ))}
        <li className="col-span-2 flex flex-col items-center justify-center gap-4 rounded-xs bg-[var(--tone-tile)] p-8 text-center lg:col-span-1">
          {cta}
        </li>
      </ul>

      <MotionProvider>
        <dialog
          ref={dialogRef}
          aria-labelledby="trainer-dialog-title"
          className="tone-canvas m-auto max-h-screen w-full max-w-4xl overflow-y-auto rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-0 text-[var(--tone-ink)] backdrop:bg-ink/60"
          onClick={(event) => {
            if (event.target === dialogRef.current) setSelectedTrainer(null);
          }}
          onClose={() => {
            setSelectedTrainer(null);
            triggerRef.current?.focus();
          }}
        >
          <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
            {selectedTrainer ? (
              <m.div
                key={selectedTrainer.slug}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="grid sm:grid-cols-2"
              >
                <div className="relative aspect-[4/5] w-full self-start overflow-hidden border-b border-[var(--tone-rule)] bg-[var(--tone-tile)] sm:border-r sm:border-b-0">
                  <TrainerPortrait
                    trainer={selectedTrainer}
                    sizes="(min-width: 640px) 28rem, 90vw"
                    fit="contain"
                  />
                </div>
                <div className="relative p-6">
                  <button
                    type="button"
                    aria-label="Tutup"
                    className="type-title absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center text-[var(--tone-muted)] hover:text-[var(--tone-ink)]"
                    onClick={() => setSelectedTrainer(null)}
                  >
                    ×
                  </button>
                  <p className="eyebrow text-[var(--tone-muted)]">Trainer</p>
                  <h3 id="trainer-dialog-title" className="type-title mt-2">
                    {selectedTrainer.name}
                  </h3>
                  <p className="eyebrow mt-2 text-[var(--tone-muted)]">
                    {selectedTrainer.role}
                  </p>
                  <p className="type-body mt-4 text-[var(--tone-muted)]">
                    {selectedTrainer.bio ?? "Profil lengkap belum tersedia."}
                  </p>
                  {highlights[selectedTrainer.slug] ? (
                    <ul className="type-small mt-6 grid gap-2 border-t border-[var(--tone-rule)] pt-4">
                      {highlights[selectedTrainer.slug].map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </m.div>
            ) : null}
          </AnimatePresence>
        </dialog>
      </MotionProvider>
    </div>
  );
}
