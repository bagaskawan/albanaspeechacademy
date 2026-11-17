"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProgramCard } from "@/lib/server/program-showcase";

const copy: Record<string, { audience: string; topics: string[] }> = {
  "public-speaking-series": { audience: "Untukmu yang ingin dasar kuat dan berlatih banyak peran bicara.", topics: ["Basic Public Speaking", "MC formal dan nonformal", "Moderator"] },
  "public-speaking-for-speakers": { audience: "Untukmu yang ingin tampil sebagai pembicara di depan audiens.", topics: ["Fundamental, opening, dan closing", "Struktur pesan", "Teknik interaktif dan tanya jawab"] },
  "sertifikasi-pembicara-profesional": { audience: "Untukmu yang membutuhkan pengakuan kompetensi sebagai pembicara.", topics: [] },
};
const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function ProgramCardView({ card, index, bundleNote }: { card: ProgramCard; index: number; bundleNote?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleTopics = (copy[card.slug]?.topics.length ? copy[card.slug].topics : card.topics).slice(0, 3);
  const additionalTopics = card.topics.filter((topic) => !visibleTopics.includes(topic));
  const numberTone = index % 2 === 0 ? "bg-panel" : "bg-sand";

  return (
    <article data-motion="rise" className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-panel border border-rule bg-card">
      <div className="p-6 md:p-8">
        <p className="eyebrow flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`flex size-12 shrink-0 items-center justify-center text-xl font-semibold tabular-nums text-ink ${numberTone}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </p>
        <h3 className="mt-3 text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.03em] text-balance md:text-[2rem]">
          {card.title}
        </h3>
        <p className="mt-4 max-w-[42em] text-lg leading-[1.55] text-muted">{copy[card.slug]?.audience ?? card.summary}</p>
      </div>

      <div className="flex flex-1 flex-col border-t border-rule p-6 md:p-8">
        {visibleTopics.length > 0 ? (
          <div>
            <p className="eyebrow">Fokus latihan</p>
            <ul className="mt-3 grid gap-2">
              {visibleTopics.map((topic) => (
                <li key={topic} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-[0.65em] size-1.5 shrink-0 bg-accent" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>

            {additionalTopics.length > 0 ? (
              <>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                >
                  <div
                    className={`overflow-hidden transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    <ul className="grid gap-2 pt-2">
                      {additionalTopics.map((topic) => (
                        <li key={topic} className="flex items-start gap-3">
                          <span aria-hidden="true" className="mt-[0.65em] size-1.5 shrink-0 bg-accent" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 border-t border-rule pt-2">
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="flex min-h-11 cursor-pointer items-center gap-2 font-display text-sm font-semibold underline decoration-control underline-offset-4 transition-colors hover:text-accent"
                    aria-expanded={isExpanded}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block text-[10px] text-accent transition-transform duration-200 ${isExpanded ? "rotate-90" : "rotate-0"
                        }`}
                    >
                      ▶
                    </span>
                    {isExpanded ? "Sembunyikan materi" : `Lihat ${additionalTopics.length} materi lainnya`}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : <p className="text-sm text-muted">Materi diumumkan bersama jadwal.</p>}

        <div className="mt-auto border-t border-rule pt-5">
          <p className="flex items-center gap-2.5 text-sm font-semibold">
            <span aria-hidden="true" className="size-2 shrink-0 bg-accent" />
            {card.statusLabel}
          </p>
          {bundleNote ? <p className="mt-3 text-sm text-muted">{bundleNote}</p> : null}
          <p className="mt-4 font-display text-2xl font-semibold tabular-nums">{card.batch?.priceIdr ? rupiah(card.batch.priceIdr) : "—"}</p>
          {card.batch?.normalPriceIdr ? <p className="text-sm text-muted line-through tabular-nums">{rupiah(card.batch.normalPriceIdr)}</p> : null}

          {card.batch ? (
            <dl className="mt-5 divide-y divide-rule border-t border-rule text-sm">
              <div className="py-3">
                <dt className="eyebrow">Format</dt>
                <dd className="mt-1">{card.batch.formatLabel}</dd>
              </div>
              <div className="py-3">
                <dt className="eyebrow">Tanggal</dt>
                <dd className="mt-1">
                  <ul className="flex flex-col gap-1 font-semibold tabular-nums leading-normal">
                    {card.batch.dateLabels.map((date) => (
                      <li key={date}>{date}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="py-3">
                <dt className="eyebrow">Jam</dt>
                <dd className="mt-1 tabular-nums">{card.batch.timeLabel}</dd>
              </div>
              <div className="pt-3">
                <dt className="eyebrow">Tempat</dt>
                <dd className="mt-1">Albana Speech Academy</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-rule p-6 md:p-8">
        {card.registrationUrl ? <Link className="button-primary" href={card.registrationUrl}>Daftar</Link> : null}
        <Link className="button-secondary" href={`/program/${encodeURIComponent(card.slug)}`}>
          Selengkapnya
        </Link>
      </div>
    </article>
  );
}
