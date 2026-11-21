import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RetryButton } from "@/components/ui/retry-button";
import { formatRupiah } from "@/lib/format";
import { getProgramEditorial, resolveProgramTopics } from "@/lib/program-editorial";
import type { ProgramCard } from "@/lib/server/program-showcase";

export type ProgramMediaItem = {
  id: number;
  kind: "image" | "video";
  src: string;
  alt: string;
  youtubeId: string | null;
};

export type ProgramPartnerItem = {
  id: number;
  name: string;
  logo_url: string | null;
};

export type ProgramTrainerItem = {
  name: string;
  role: string;
};

function PublicPage({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="tone-canvas overflow-x-clip pb-20 pt-6 md:pb-28 md:pt-8"
      >
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

export function ProgramDetailPage({
  card,
  media,
  consultationHref,
  partners = [],
  trainers = [],
}: {
  card: ProgramCard;
  media: ProgramMediaItem[];
  consultationHref?: string;
  partners?: ProgramPartnerItem[];
  trainers?: ProgramTrainerItem[];
}) {
  const isInhouse = card.slug === "inhouse-training";
  const editorial = getProgramEditorial(card.slug);
  const topics = resolveProgramTopics(card.slug, card.topics);
  const effectivePriceIdr = card.batch?.priceIdr ?? card.priceIdr ?? null;
  const effectiveNormalPriceIdr =
    card.batch?.normalPriceIdr ?? card.normalPriceIdr ?? null;

  const hasAudience = Boolean(editorial && editorial.audiencePoints.length > 0);
  const hasLearning = Boolean(
    topics.length > 0 ||
      (editorial &&
        (editorial.learningIntro ||
          editorial.practiceFormats.length > 0 ||
          (editorial.trainingAreas?.length ?? 0) > 0)),
  );
  const hasTrainers = trainers.length > 0;
  const hasPartners = isInhouse && partners.length > 0;
  const hasMedia = media.length > 0;

  const whatsappUrl = consultationHref
    ? `${consultationHref}?text=${encodeURIComponent(
        "Halo Admin Albana, saya ingin berkonsultasi tentang Inhouse Training.",
      )}`
    : null;

  return (
    <PublicPage>
      <Container className="max-w-6xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 border-b border-rule pb-4 dark:border-white/15"
        >
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <li>
              <Link
                href="/"
                className="inline-flex min-h-8 items-center underline-offset-4 transition-colors hover:text-[var(--tone-ink)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Beranda
              </Link>
            </li>
            <li aria-hidden="true" className="select-none opacity-60">
              /
            </li>
            <li
              aria-current="page"
              className="font-medium text-[var(--tone-ink)] break-words"
            >
              {card.title}
            </li>
          </ol>
        </nav>

        <article className="grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start lg:gap-x-8">
          <header className="min-w-0 max-w-[65ch] lg:col-start-1 lg:row-start-1">
            <p className="eyebrow dark:text-slate-300">
              {isInhouse ? "Inhouse Training" : "Public Training"}
            </p>
            <h1 className="mt-3 text-[2rem] leading-[1.1] font-semibold tracking-[-0.035em] text-balance break-words sm:text-[2.5rem] lg:text-[3rem]">
              {card.title}
            </h1>
            <p className="mt-4 text-base leading-[1.65] text-muted text-pretty sm:text-lg">
              {card.summary}
            </p>
          </header>

          <aside
            aria-labelledby="schedule-card-title"
            className="min-w-0 border border-rule bg-card p-6 dark:border-white/15 md:p-7 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:row-span-2"
          >
            <h2
              id="schedule-card-title"
              className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--tone-ink)]"
            >
              {isInhouse
                ? "Konsultasi Inhouse"
                : "Jadwal, biaya, dan pendaftaran"}
            </h2>

            <p className="mt-3 flex items-center gap-2.5 text-sm font-semibold text-[var(--tone-ink)]">
              <span aria-hidden="true" className="size-2 shrink-0 bg-accent" />
              <span>{card.statusLabel}</span>
            </p>

            {isInhouse ? (
              <div className="mt-5 border-t border-rule pt-4 dark:border-white/15">
                <dl className="divide-y divide-rule text-sm dark:divide-white/15">
                  <div className="py-3 first:pt-0">
                    <dt className="eyebrow dark:text-slate-300">Format</dt>
                    <dd className="mt-1 text-[var(--tone-ink)]">
                      Materi, silabus, tanggal, dan waktu disusun bersama tim
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="eyebrow dark:text-slate-300">Lokasi</dt>
                    <dd className="mt-1 text-[var(--tone-ink)]">
                      Di tempat perusahaan atau lokasi yang disepakati
                    </dd>
                  </div>
                  <div className="pt-3">
                    <dt className="eyebrow dark:text-slate-300">Biaya</dt>
                    <dd className="mt-1 text-[var(--tone-ink)]">
                      Menyesuaikan materi, jumlah peserta, dan durasi pelatihan
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  {whatsappUrl ? (
                    <a
                      className="button-primary min-h-11 w-full justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Konsultasi Inhouse via WhatsApp</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <p className="text-sm leading-relaxed text-muted">
                      Kontak WhatsApp resmi belum diterbitkan. Kanal konsultasi
                      akan muncul setelah admin memperbarui kontak.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5 border-t border-rule pt-4 dark:border-white/15">
                {card.batch ? (
                  <dl className="divide-y divide-rule text-sm dark:divide-white/15">
                    <div className="py-3 first:pt-0">
                      <dt className="eyebrow dark:text-slate-300">Batch</dt>
                      <dd className="mt-1 font-medium text-[var(--tone-ink)]">
                        {card.batch.name}
                      </dd>
                    </div>
                    {card.batch.sessionCountKnown ? (
                      <div className="py-3">
                        <dt className="eyebrow dark:text-slate-300">
                          Jumlah sesi
                        </dt>
                        <dd className="mt-1 tabular-nums text-[var(--tone-ink)]">
                          {card.batch.formatLabel}
                        </dd>
                      </div>
                    ) : null}
                    <div className="py-3">
                      <dt className="eyebrow dark:text-slate-300">Tanggal</dt>
                      <dd className="mt-1">
                        <ul className="flex flex-col gap-1 font-medium tabular-nums leading-normal text-[var(--tone-ink)]">
                          {card.batch.sessionDates.map((session) => (
                            <li key={`${session.isoDate}-${session.label}`}>
                              {session.isoDate ? (
                                <time dateTime={session.isoDate}>
                                  {session.label}
                                </time>
                              ) : (
                                session.label
                              )}
                            </li>
                          ))}
                        </ul>
                        {card.batch.scheduleMode === "start_only" && card.batch.sessionCountKnown ? (
                          <p className="mt-1 text-xs text-muted">
                            Total {card.batch.formatLabel} sesuai jadwal batch.
                          </p>
                        ) : null}
                      </dd>
                    </div>
                    <div className="py-3">
                      <dt className="eyebrow dark:text-slate-300">Jam</dt>
                      <dd className="mt-1 tabular-nums text-[var(--tone-ink)]">
                        {card.batch.timeLabel}
                      </dd>
                    </div>
                    <div className="py-3">
                      <dt className="eyebrow dark:text-slate-300">Lokasi</dt>
                      <dd className="mt-1 text-[var(--tone-ink)]">
                        {card.batch.venueLabel}
                      </dd>
                    </div>
                    <div className="pt-3">
                      <dt className="eyebrow dark:text-slate-300">
                        Biaya resmi
                      </dt>
                      <dd className="mt-1 tabular-nums">
                        {effectivePriceIdr ? (
                          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                            <span className="text-lg font-semibold text-[var(--tone-ink)]">
                              {formatRupiah(effectivePriceIdr)}
                            </span>
                            {effectiveNormalPriceIdr ? (
                              <span className="text-sm text-muted line-through">
                                {formatRupiah(effectiveNormalPriceIdr)}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted">
                            Biaya belum ditetapkan
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <dl className="divide-y divide-rule text-sm dark:divide-white/15">
                    <div className="py-3 first:pt-0">
                      <dt className="eyebrow dark:text-slate-300">Jadwal</dt>
                      <dd className="mt-1 text-muted">
                        Tanggal, jam, dan lokasi akan ditampilkan setelah batch
                        diterbitkan.
                      </dd>
                    </div>
                    <div className="pt-3">
                      <dt className="eyebrow dark:text-slate-300">
                        Biaya resmi
                      </dt>
                      <dd className="mt-1 tabular-nums">
                        {effectivePriceIdr ? (
                          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                            <span className="text-lg font-semibold text-[var(--tone-ink)]">
                              {formatRupiah(effectivePriceIdr)}
                            </span>
                            {effectiveNormalPriceIdr ? (
                              <span className="text-sm text-muted line-through">
                                {formatRupiah(effectiveNormalPriceIdr)}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted">
                            Biaya belum ditetapkan
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}

                <div className="mt-6">
                  {card.registrationUrl ? (
                    <Link
                      className="button-primary min-h-11 w-full justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      href={card.registrationUrl}
                    >
                      <span>Daftar program</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <p className="text-sm leading-relaxed text-muted">
                      {card.batch
                        ? "Pendaftaran batch ini sedang ditutup. Pendaftaran dibuka kembali pada batch berikutnya."
                        : "Pendaftaran dibuka setelah jadwal batch tersedia."}
                    </p>
                  )}
                </div>
              </div>
            )}
          </aside>

          <div className="min-w-0 max-w-[65ch] space-y-12 lg:col-start-1 lg:row-start-2">
            {hasAudience && editorial ? (
              <section
                aria-labelledby="audience-title"
                className="border-t border-rule pt-8 dark:border-white/15"
              >
                <h2
                  id="audience-title"
                  className="font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--tone-ink)] md:text-[1.75rem]"
                >
                  Untuk siapa
                </h2>
                <p className="mt-3 text-base leading-[1.65] text-[var(--tone-ink)] text-pretty">
                  {editorial.audienceLead}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted sm:text-base">
                  {editorial.audiencePoints.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 bg-accent"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hasLearning ? (
              <section
                aria-labelledby="curriculum-title"
                className="border-t border-rule pt-8 dark:border-white/15"
              >
                <h2
                  id="curriculum-title"
                  className="font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--tone-ink)] md:text-[1.75rem]"
                >
                  Materi dan cara belajar
                </h2>

                {editorial?.learningIntro ? (
                  <p className="mt-3 text-base leading-[1.65] text-muted text-pretty">
                    {editorial.learningIntro}
                  </p>
                ) : null}

                {topics.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="eyebrow dark:text-slate-300">
                      Materi yang dipelajari
                    </h3>
                    <ol className="mt-3 divide-y divide-rule border-y border-rule dark:divide-white/15 dark:border-white/15">
                      {topics.map((topic, index) => (
                        <li
                          key={topic}
                          className="flex items-baseline gap-4 py-3.5 sm:gap-6"
                        >
                          <span
                            className="eyebrow shrink-0 text-accent tabular-nums dark:text-sky-300"
                            aria-hidden="true"
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm font-medium leading-snug text-[var(--tone-ink)] sm:text-base">
                            {topic}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {editorial && editorial.practiceFormats.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="eyebrow dark:text-slate-300">
                      {isInhouse ? "Alur konsultasi dan pelaksanaan" : "Bentuk praktik"}
                    </h3>
                    <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted sm:text-base">
                      {editorial.practiceFormats.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-2 size-1.5 shrink-0 bg-accent"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {editorial?.trainingAreas && editorial.trainingAreas.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="eyebrow dark:text-slate-300">
                      Bidang pelatihan yang tersedia
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {editorial.trainingAreas.map((area) => (
                        <li
                          key={area}
                          className="border border-rule bg-card px-3 py-1.5 text-sm text-[var(--tone-ink)] dark:border-white/15"
                        >
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}

            {hasTrainers ? (
              <section
                aria-labelledby="trainer-title"
                className="border-t border-rule pt-8 dark:border-white/15"
              >
                <h2
                  id="trainer-title"
                  className="font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--tone-ink)] md:text-[1.75rem]"
                >
                  Trainer
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {trainers.map((trainer) => (
                    <li
                      key={trainer.name}
                      className="border border-rule bg-card p-4 dark:border-white/15"
                    >
                      <p className="font-medium text-[var(--tone-ink)]">
                        {trainer.name}
                      </p>
                      <p className="mt-1 text-sm text-muted">{trainer.role}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hasPartners ? (
              <section
                aria-labelledby="partners-title"
                className="border-t border-rule pt-8 dark:border-white/15"
              >
                <h2
                  id="partners-title"
                  className="font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--tone-ink)] md:text-[1.75rem]"
                >
                  Pernah melatih
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[...partners]
                    .sort(
                      (a, b) =>
                        Number(Boolean(b.logo_url)) -
                        Number(Boolean(a.logo_url)),
                    )
                    .map((partner) => (
                      <li
                        key={partner.id}
                        className="flex min-h-24 items-center justify-center border border-rule bg-card p-4 dark:border-white/15"
                      >
                        {partner.logo_url ? (
                          <img
                            src={partner.logo_url}
                            alt={partner.name || "Partner Albana Speech Academy"}
                            loading="lazy"
                            className="h-auto max-h-14 w-auto max-w-36 object-contain"
                          />
                        ) : partner.name ? (
                          <span className="text-center text-sm font-semibold text-[var(--tone-ink)]">
                            {partner.name}
                          </span>
                        ) : null}
                      </li>
                    ))}
                </ul>
              </section>
            ) : null}

            {hasMedia ? (
              <section
                aria-labelledby="program-media-title"
                className="border-t border-rule pt-8 dark:border-white/15"
              >
                <h2
                  id="program-media-title"
                  className="font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--tone-ink)] md:text-[1.75rem]"
                >
                  Dokumentasi
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {media.map((item) => (
                    <figure
                      key={item.id}
                      className="overflow-hidden border border-rule bg-card dark:border-white/15"
                    >
                      <div className="aspect-video w-full bg-surface dark:bg-slate-900">
                        {item.kind === "image" ? (
                          <img
                            src={item.src}
                            alt={item.alt}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : item.youtubeId ? (
                          <iframe
                            src={item.src}
                            title={item.alt}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="h-full w-full border-0"
                          />
                        ) : (
                          <video
                            src={item.src}
                            controls
                            preload="metadata"
                            aria-label={item.alt}
                            className="h-full w-full"
                          />
                        )}
                      </div>
                      <figcaption className="p-3 text-sm text-muted">
                        {item.alt}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </Container>
    </PublicPage>
  );
}

export function ProgramDetailLoading() {
  return (
    <PublicPage>
      <Container className="max-w-6xl">
        <div className="pt-8" aria-label="Memuat detail program">
          <div className="h-3 w-28 bg-surface dark:bg-slate-800" />
          <div className="mt-5 h-12 w-full max-w-2xl bg-surface dark:bg-slate-800" />
          <div className="mt-5 h-5 w-full max-w-xl bg-surface dark:bg-slate-800" />
        </div>
      </Container>
    </PublicPage>
  );
}

export function ProgramDetailFailure() {
  return (
    <PublicPage>
      <Container className="max-w-3xl">
        <div className="py-12 md:py-20">
          <p className="eyebrow dark:text-slate-300">Detail program</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            Program belum bisa dimuat
          </h1>
          <p className="mt-4 max-w-[42em] text-muted">
            Data program sedang tidak tersedia. Coba muat ulang sebentar lagi.
          </p>
          <RetryButton />
        </div>
      </Container>
    </PublicPage>
  );
}

export function ProgramNotFound() {
  return (
    <PublicPage>
      <Container className="max-w-3xl">
        <div className="py-12 md:py-20">
          <p className="eyebrow dark:text-slate-300">Program</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            Program tidak ditemukan
          </h1>
          <p className="mt-4 max-w-[42em] text-muted">
            Program yang kamu cari tidak tersedia atau belum diterbitkan.
          </p>
          <Link
            className="button-primary mt-7 min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href="/#program"
          >
            Lihat semua program
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </PublicPage>
  );
}
