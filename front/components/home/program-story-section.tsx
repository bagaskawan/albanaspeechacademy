"use client";

import Link from "next/link";
import type { HomeProgram } from "@/lib/home-data";
import { BentoGallery } from "./bento-gallery";
import { SkeletonImage } from "./skeleton-image";
import { VideoBreak } from "./video-break";
import { MoreLink } from "./ui/more-link";

const copy: Record<string, { audience: string; story: string; topics: string[] }> = {
  "public-speaking-series": {
    audience: "Untukmu yang ingin dasar kuat dan berlatih banyak peran bicara.",
    story: "Cocok bila kamu baru mulai. Latih dasar bicara, lalu coba peran MC dan moderator di kelas yang sama.",
    topics: ["Basic Public Speaking", "MC formal dan nonformal", "Moderator"],
  },
  "public-speaking-for-speakers": {
    audience: "Untukmu yang ingin tampil sebagai pembicara di depan audiens.",
    story: "Untuk kamu yang akan berdiri di depan audiens: susun pesan, buka dengan kuat, dan tutup dengan jelas.",
    topics: ["Fundamental, opening, dan closing", "Struktur pesan", "Teknik interaktif dan tanya jawab"],
  },
  "sertifikasi-pembicara-profesional": {
    audience: "Untukmu yang membutuhkan pengakuan kompetensi sebagai pembicara.",
    story: "Untuk kamu yang ingin kemampuan bicaranya diakui secara formal.",
    topics: [],
  },
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function ProgramStorySection({ program, index }: { program: HomeProgram; index: number }) {
  const { card, media, bundleNote } = program;
  const text = copy[card.slug];
  const topics = card.topics.length > 0 ? card.topics : (text?.topics ?? []);
  const flip = index % 2 === 1;
  const photos = media.filter((item) => item.kind === "image");
  const previews = photos.slice(0, 2);
  const gallery = photos.slice(2);
  const video = media.find((item) => item.kind === "video") ?? null;

  return (
    <div className="border-b border-[var(--tone-rule)]">
    <article
      id={card.slug}
      aria-labelledby={`${card.slug}-title`}
      className={video ? "pt-12 pb-4 lg:pt-20 lg:pb-6" : "py-12 lg:py-20"}
    >
      <div className="home-grid items-start gap-y-8">
        {/* Teks program */}
        <div className={`col-span-4 flex flex-col gap-6 sm:col-span-8 lg:col-span-5 ${flip ? "lg:order-last lg:col-start-8" : ""}`}>
          <p aria-hidden="true" className="type-mega italic text-[var(--tone-rule)]">
            {String(index + 1).padStart(2, "0")}
          </p>
          <div className="flex flex-col gap-3">
            <h4 id={`${card.slug}-title`} data-motion="heading" className="type-display text-balance">
              {card.title}
            </h4>
            <p data-motion="rise" className="type-lead text-[var(--tone-ink)] text-pretty">
              {text?.audience ?? card.summary}
            </p>
            {text?.story ? (
              <p data-motion="rise" className="type-body text-[var(--tone-muted)] text-pretty">{text.story}</p>
            ) : null}
          </div>

          <div data-motion="rise" className="mt-2 border-t border-[var(--tone-rule)] pt-6">
            <div className="flex items-baseline justify-between gap-2">
              <p className="type-label text-[var(--tone-muted)]">Yang kamu latih</p>
              {topics.length > 0 ? (
                <span className="type-small tabular-nums text-[var(--tone-muted)]">{topics.length} materi</span>
              ) : null}
            </div>
            {topics.length > 0 ? (
              topics.length > 4 ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
                  {[
                    topics.slice(0, Math.ceil(topics.length / 2)),
                    topics.slice(Math.ceil(topics.length / 2)),
                  ].map((col, colIndex) => {
                    const offset = colIndex === 0 ? 0 : Math.ceil(topics.length / 2);
                    return (
                      <ol key={colIndex} className="border-t border-[var(--tone-rule)]">
                        {col.map((topic, itemIndex) => (
                          <li key={topic} className="flex items-baseline gap-3 border-b border-[var(--tone-rule)] py-3">
                            <span className="type-small shrink-0 italic tabular-nums text-[var(--tone-accent)]">
                              {String(offset + itemIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="type-small leading-snug text-[var(--tone-ink)]">{topic}</span>
                          </li>
                        ))}
                      </ol>
                    );
                  })}
                </div>
              ) : (
                <ol className="mt-4 border-t border-[var(--tone-rule)]">
                  {topics.map((topic, topicIndex) => (
                    <li key={topic} className="flex items-baseline gap-4 border-b border-[var(--tone-rule)] py-3">
                      <span className="type-small shrink-0 italic tabular-nums text-[var(--tone-accent)]">
                        {String(topicIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="type-body">{topic}</span>
                    </li>
                  ))}
                </ol>
              )
            ) : (
              <p className="type-small mt-3 text-[var(--tone-muted)]">Materi diumumkan bersama jadwal.</p>
            )}
          </div>
        </div>

        {/* Dokumentasi lalu batch terdekat */}
        <div className={`col-span-4 flex flex-col gap-4 sm:col-span-8 lg:col-span-7 ${flip ? "lg:col-start-1" : ""}`}>
          {/* Pratinjau dua foto; dokumentasi lengkap ada di bab Dokumentasi. */}
          {previews.length > 0 ? (
            <div className="flex flex-col gap-2 sm:pb-8">
              <div className="grid grid-cols-2 gap-2">
                {previews.map((item, photoIndex) => (
                  <div
                    key={item.id}
                    data-motion="media"
                    className={`relative overflow-hidden rounded-xs bg-[var(--tone-tile)] ${photoIndex === 0 ? "aspect-[4/5]" : "aspect-[4/5] sm:translate-y-8"}`}
                  >
                    <SkeletonImage fill src={item.src} alt={item.alt} sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover object-top" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex aspect-[2/1] items-center justify-center rounded-xs bg-[var(--tone-tile)] p-6 text-center">
              <p className="type-small max-w-[30ch] text-[var(--tone-muted)]">
                Dokumentasi kelas ini tampil setelah batch pertama berjalan.
              </p>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-stretch">
            <div className="flex flex-col gap-2 rounded-xs bg-[var(--tone-tile)] p-4 sm:p-6">
              <p className="type-label text-[var(--tone-muted)]">Batch terdekat</p>
              {card.batch ? (
                <>
                  <p className="type-body font-medium">{card.batch.name}</p>
                  <p className="type-small tabular-nums text-[var(--tone-muted)]">
                    {card.batch.scheduleMode === "start_only"
                      ? `${card.batch.dateLabels[0]} · ${card.batch.formatLabel}`
                      : card.batch.dateLabels.join(" · ")}
                  </p>
                </>
              ) : (
                <p className="type-body">Jadwal menyusul</p>
              )}
              {bundleNote ? <p className="type-small text-[var(--tone-accent)]">{bundleNote}</p> : null}
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-xs bg-[var(--tone-sun)] p-4 text-[var(--tone-on-sun)] sm:min-w-[15rem] sm:p-6">
              <div>
                <p className="type-small font-semibold">{card.statusLabel}</p>
                <p className="type-title mt-1 tabular-nums">
                  {card.batch?.priceIdr ? rupiah(card.batch.priceIdr) : "—"}
                </p>
                {card.batch?.normalPriceIdr ? (
                  <p className="type-small tabular-nums line-through">{rupiah(card.batch.normalPriceIdr)}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-x-4">
                {card.registrationUrl ? (
                  <Link className="button-primary w-full justify-center" href={card.registrationUrl}>
                    Daftar
                  </Link>
                ) : (
                  <MoreLink href={`/program/${encodeURIComponent(card.slug)}`}>Detail</MoreLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dokumentasi lain kelas ini, selebar seksi (mosaik bila cukup foto). */}
      {gallery.length > 0 ? (
        <div className="mt-16 flex flex-col gap-4 lg:mt-24">
          <div className="flex items-baseline justify-between gap-4">
            <p className="type-label text-[var(--tone-muted)]">Galeri {card.title}</p>
            <p className="type-small text-[var(--tone-muted)]">{gallery.length} foto</p>
          </div>
          <BentoGallery media={gallery} label={`Galeri ${card.title}`} variant="mosaic" />
        </div>
      ) : null}
    </article>

    {/* Video kelas menjadi jeda antarprogram. */}
    {video ? <VideoBreak video={video} programTitle={card.title} /> : null}
    </div>
  );
}
