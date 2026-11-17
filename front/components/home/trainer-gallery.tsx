"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { MotionProvider } from "@/components/motion/MotionProvider";

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

function TrainerPortrait({ trainer, sizes, fit = "cover" }: { trainer: Trainer; sizes: string; fit?: "cover" | "contain" }) {
  if (trainer.image) {
    return <Image src={trainer.image} alt="" fill sizes={sizes} unoptimized className={fit === "contain" ? "object-contain" : "object-cover object-top"} />;
  }

  return (
    <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-display text-5xl font-semibold tracking-tight text-[var(--tone-accent)] md:text-6xl">
      {trainer.name.split(" ").map((part) => part[0]).join("")}
    </span>
  );
}

export function TrainerGallery({ trainers }: { trainers: Trainer[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedTrainer && !dialog.open) dialog.showModal();
  }, [selectedTrainer]);

  return (
    <>
      <ul className="mt-8 grid list-none grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {trainers.map((trainer) => (
          <li key={trainer.slug} data-motion="slide">
            <button
              type="button"
              aria-haspopup="dialog"
              className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-card bg-[var(--tone-tile)] text-left hover:bg-[var(--tone-rule)]"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setSelectedTrainer(trainer);
              }}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--tone-tile)]">
                <TrainerPortrait trainer={trainer} sizes="(min-width: 768px) 19rem, 50vw" />
              </div>
              <span className="p-4 sm:p-5">
                <span className="block text-center text-lg leading-[1.2] font-semibold tracking-[-0.02em] transition-colors ">
                  {trainer.name}
                </span>
                <span className="eyebrow mt-1.5 block text-center">{trainer.role}</span>
                <span className="mt-3 block text-center text-sm font-semibold text-[var(--tone-accent)] underline underline-offset-4">Lihat profil</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <MotionProvider><dialog
        ref={dialogRef}
        aria-labelledby="trainer-dialog-title"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(56rem,calc(100vw-2rem))] overflow-y-auto tone-canvas rounded-panel border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-0 text-[var(--tone-ink)] backdrop:bg-ink/60"
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
          <m.div key={selectedTrainer.slug} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }} className="grid md:grid-cols-2">
            <div className="relative aspect-[3/4] w-full self-start overflow-hidden border-b border-[var(--tone-rule)] bg-[var(--tone-tile)] md:border-b-0 md:border-r">
              <TrainerPortrait trainer={selectedTrainer} sizes="(min-width: 768px) 28rem, 90vw" fit="contain" />
            </div>
            <div className="relative p-6 md:p-8">
              <button
                type="button"
                aria-label="Tutup"
                className="absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center text-2xl leading-none text-[var(--tone-muted)] hover:text-[var(--tone-ink)]"
                onClick={() => setSelectedTrainer(null)}
              >
                ×
              </button>
              <p className="eyebrow">Trainer</p>
              <h3
                id="trainer-dialog-title"
                className="mt-2 text-2xl leading-[1.1] font-medium tracking-[-0.03em] md:text-[2rem]"
              >
                {selectedTrainer.name}
              </h3>
              <p className="eyebrow mt-2">{selectedTrainer.role}</p>
              <p className="mt-4 leading-[1.6] text-[var(--tone-muted)]">{selectedTrainer.bio ?? "Profil lengkap belum tersedia."}</p>
              {highlights[selectedTrainer.slug] ? <ul className="mt-5 grid gap-2 border-t border-[var(--tone-rule)] pt-4 text-sm">{highlights[selectedTrainer.slug].map((point) => <li key={point}>{point}</li>)}</ul> : null}
            </div>
          </m.div>
        ) : null}
        </AnimatePresence>
      </dialog></MotionProvider>
    </>
  );
}
