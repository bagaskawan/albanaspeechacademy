"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { HomeProgram } from "@/lib/home-data";
import { BentoGallery } from "./bento-gallery";

const copy: Record<string, { audience: string; topics: string[] }> = {
  "public-speaking-series": {
    audience: "Untukmu yang ingin dasar kuat dan berlatih banyak peran bicara.",
    topics: ["Basic Public Speaking", "MC formal dan nonformal", "Moderator"],
  },
  "public-speaking-for-speakers": {
    audience: "Untukmu yang ingin tampil sebagai pembicara di depan audiens.",
    topics: ["Fundamental, opening, dan closing", "Struktur pesan", "Teknik interaktif dan tanya jawab"],
  },
  "sertifikasi-pembicara-profesional": {
    audience: "Untukmu yang membutuhkan pengakuan kompetensi sebagai pembicara.",
    topics: [],
  },
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export function ProgramStorySection({ program, index }: { program: HomeProgram; index: number }) {
  const { card, media, bundleNote } = program;

  const allTopics = card.topics.length > 0
    ? card.topics
    : (copy[card.slug]?.topics ?? []);
  const isOdd = index % 2 === 1;

  return (
    <section
      id={card.slug}
      aria-labelledby={`${card.slug}-title`}
      className="border-t border-[var(--tone-rule)] py-14 lg:py-20"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-12">
        <div
          className={`space-y-6 lg:col-span-5 ${
            isOdd ? "lg:order-last lg:col-start-8" : ""
          }`}
        >
          <div className="space-y-3">
            <span aria-hidden="true" className="type-mega block text-[var(--tone-rule)]">
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3
              id={`${card.slug}-title`}
              data-motion="heading"
              className="type-title text-balance"
            >
              {card.title}
            </h3>
            <p data-motion="rise" className="max-w-[42ch] text-base leading-[1.6] text-[var(--tone-muted)] text-pretty md:text-lg">
              {copy[card.slug]?.audience ?? card.summary}
            </p>
          </div>

          <div
            data-motion="rise"
          >
            <p className="eyebrow">
              Yang akan dipelajari
            </p>
            {allTopics.length > 0 ? (
              <ol className="mt-4 divide-y divide-[var(--tone-rule)] border-y border-[var(--tone-rule)]">
                {allTopics.map((topic, topicIndex) => (
                  <li key={topic} className="flex items-start gap-3.5 py-3">
                    <span className="mt-0.5 font-display text-xs font-bold tabular-nums text-[var(--tone-accent)]">
                      {String(topicIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium leading-snug md:text-base">
                      {topic}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-[var(--tone-muted)]">
                Materi diumumkan bersama jadwal.
              </p>
            )}
          </div>

          <div
            data-motion="rise"
            className="border-t-2 border-[var(--tone-accent)] bg-[var(--tone-tile)] p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow">{card.statusLabel}</p>
              {card.batch ? (
                <p className="text-xs font-medium text-[var(--tone-muted)]">{card.batch.name}</p>
              ) : null}
            </div>

            {card.batch && card.batch.dateLabels.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--tone-muted)] tabular-nums">
                {card.batch.dateLabels.map((date) => (
                  <li key={date}>{date}</li>
                ))}
              </ul>
            ) : null}

            <div className="mt-5 border-t border-[var(--tone-rule)] pt-4">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <p className="type-title tabular-nums">
                  {card.batch?.priceIdr ? rupiah(card.batch.priceIdr) : "—"}
                </p>
                {card.batch?.normalPriceIdr ? (
                  <p className="text-sm text-[var(--tone-muted)] line-through tabular-nums">
                    {rupiah(card.batch.normalPriceIdr)}
                  </p>
                ) : null}
              </div>
              {bundleNote ? (
                <p className="mt-1 text-xs font-medium text-[var(--tone-accent)]">{bundleNote}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {card.registrationUrl ? (
                  <Link className="button-primary" href={card.registrationUrl}>
                    <span>Daftar</span>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : null}
                <Link className="button-secondary" href={`/program/${card.slug}`}>
                  Selengkapnya
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-7 ${isOdd ? "lg:col-start-1" : ""}`}>
          {media.length > 0 ? (
            <BentoGallery media={media} label={`Dokumentasi ${card.title}`} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
