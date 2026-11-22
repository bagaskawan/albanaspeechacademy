import Link from "next/link";
import type { HomeData } from "@/lib/home-data";
import { readProgramShowcase } from "@/lib/server/program-showcase";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { RetryButton } from "@/components/ui/retry-button";
import { SectionIntro } from "./section-intro";
import { SkeletonImage } from "./skeleton-image";
import { Accent } from "./ui/accent";
import { Tile } from "./ui/tile";

export async function ScheduleSection({
  programs,
  moments,
}: {
  programs: HomeData["programs"];
  moments: HomeData["moments"];
}) {
  const showcase = await readProgramShowcase();
  let whatsapp: string | undefined;
  try {
    const channel = (await readPublishedContacts()).find((item) => item.kind === "whatsapp");
    whatsapp = channel ? contactHref(channel) : undefined;
  } catch { /* Contact link is optional. */ }

  const cards =
    showcase.status === "ready"
      ? showcase.cards.filter((card) => card.slug !== "inhouse-training" && card.batch)
      : [];

  return (
    <section id="jadwal" className="tone-mist home-section" aria-labelledby="jadwal-title">
      <div className="home-container home-stack-head">
        <SectionIntro
          eyebrow="08 · Jadwal"
          title={
            <>
              Pilih batch, <Accent>tandai kalendermu</Accent>
            </>
          }
          titleId="jadwal-title"
          description="Pilih batch yang cocok dengan kalendermu. Semua tanggal, jam, dan tempat ada di sini."
        />

        {showcase.status === "failed" ? (
          <Tile tone="tile">
            <p className="type-body">Jadwal belum bisa dimuat.</p>
            <RetryButton />
          </Tile>
        ) : cards.length ? (
          <div className="grid gap-2">
            {cards.map((card, cardIndex) => {
              const thumb =
                (programs === "failed"
                  ? undefined
                  : programs
                    .find((program) => program.card.slug === card.slug)
                    ?.media.find((item) => item.kind === "image")) ??
                moments[4 + cardIndex];

              return (
                <Tile key={card.slug} tone="tile">
                  <article data-motion="rise" className="home-grid gap-y-4 lg:gap-y-6">
                    {thumb ? (
                      <div className="col-span-4 sm:col-span-8 lg:col-span-3">
                        <div
                          data-motion="media"
                          className="relative aspect-video overflow-hidden rounded-xs bg-[var(--tone-bg)]"
                        >
                          <SkeletonImage
                            src={thumb.src}
                            alt={thumb.alt}
                            fill
                            sizes="(min-width: 1024px) 18rem, 90vw"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ) : null}

                    <div
                      className={`col-span-4 flex flex-col gap-4 sm:col-span-8 ${thumb ? "lg:col-span-6" : "lg:col-span-9"
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="eyebrow text-[var(--tone-muted)]">Program</p>
                          <span className="type-micro inline-flex h-5 shrink-0 items-center rounded-xs bg-[var(--tone-sun)] px-1.5 text-[var(--tone-on-sun)] lg:hidden">
                            {card.statusLabel}
                          </span>
                        </div>
                        <h3 className="type-title mt-1">
                          {card.title} · {card.batch!.name}
                        </h3>
                      </div>

                      <ol className="divide-y divide-[var(--tone-rule)] border-y border-[var(--tone-rule)]">
                        {card.batch!.scheduleMode === "start_only" ? (
                          <>
                            <li
                              data-motion="slide"
                              className="type-small flex flex-wrap gap-x-4 gap-y-1 py-2"
                            >
                              <strong className="shrink-0">Mulai</strong>
                              <span>{card.batch!.dateLabels[0]?.replace(/^Mulai\s+/i, "")}</span>
                              <span className="tabular-nums text-[var(--tone-muted)]">
                                {card.batch!.timeLabel}
                              </span>
                            </li>
                            <li
                              data-motion="slide"
                              className="type-small flex flex-wrap gap-x-4 gap-y-1 py-2"
                            >
                              <strong className="shrink-0">Format</strong>
                              <span>{card.batch!.formatLabel}</span>
                            </li>
                          </>
                        ) : (
                          card.batch!.dateLabels.map((date, index) => (
                            <li
                              key={`${date}-${index}`}
                              data-motion="slide"
                              className="type-small flex flex-wrap gap-x-4 gap-y-1 py-2"
                            >
                              <strong className="shrink-0">Sesi {index + 1}</strong>
                              <span>{date}</span>
                              <span className="tabular-nums text-[var(--tone-muted)]">
                                {card.batch!.timeLabel}
                              </span>
                            </li>
                          ))
                        )}
                      </ol>

                      <p className="type-small text-[var(--tone-muted)]">
                        Tempat: {card.batch!.venueLabel}
                      </p>
                    </div>

                    <div className="col-span-4 flex flex-col justify-center gap-3 border-t border-[var(--tone-rule)] pt-4 sm:col-span-8 lg:col-span-3 lg:items-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                      <span className="type-micro hidden h-5 items-center rounded-xs bg-[var(--tone-sun)] px-2 text-[var(--tone-on-sun)] lg:inline-flex">
                        {card.statusLabel}
                      </span>

                      <div className="flex w-full flex-col gap-2 lg:items-end">
                        {card.registrationUrl ? (
                          <Link href={card.registrationUrl} className="button-primary w-full justify-center lg:w-full">
                            Daftar kelas ini
                          </Link>
                        ) : whatsapp ? (
                          <a
                            href={whatsapp}
                            className="button-primary w-full justify-center lg:w-full"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Tanya admin
                          </a>
                        ) : null}
                        <Link
                          href={`/program/${encodeURIComponent(card.slug)}`}
                          className="type-small inline-flex min-h-9 items-center justify-center text-[var(--tone-muted)] underline underline-offset-4 transition-colors hover:text-[var(--tone-ink)]"
                        >
                          Lihat detail program
                        </Link>
                      </div>
                    </div>
                  </article>
                </Tile>
              );
            })}
          </div>
        ) : (
          <Tile tone="tile">
            <p className="type-body">Jadwal kelas berikutnya belum tersedia.</p>
            {whatsapp ? (
              <a
                href={whatsapp}
                className="button-secondary mt-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat lewat WhatsApp
              </a>
            ) : null}
          </Tile>
        )}
      </div>
    </section>
  );
}
