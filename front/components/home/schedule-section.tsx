import Link from "next/link";
import type { HomeData } from "@/lib/home-data";
import { readProgramShowcase } from "@/lib/server/program-showcase";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { RetryButton } from "@/components/ui/retry-button";
import { SectionIntro } from "./section-intro";
import { ScheduleThumb } from "./schedule-thumb";
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
          <div className="grid gap-3">
            {cards.map((card, cardIndex) => {
              const flyerUrl = card.batch?.flyerUrl ?? null;
              const fallbackThumb =
                (programs === "failed"
                  ? undefined
                  : programs
                    .find((program) => program.card.slug === card.slug)
                    ?.media.find((item) => item.kind === "image")) ??
                moments[4 + cardIndex];
              const thumbSrc = flyerUrl ?? fallbackThumb?.src ?? null;
              const thumbAlt = flyerUrl
                ? `Flyer ${card.title} · ${card.batch!.name}`
                : fallbackThumb?.alt ?? card.title;
              const isFlyer = Boolean(flyerUrl);

              return (
                <Tile key={card.slug} tone="tile">
                  <article data-motion="rise" className="home-grid items-center gap-y-5 lg:gap-y-6">
                    {thumbSrc ? (
                      <div className="col-span-4 sm:col-span-8 lg:col-span-3">
                        <ScheduleThumb
                          src={thumbSrc}
                          alt={thumbAlt}
                          title={`${card.title} · ${card.batch!.name}`}
                          isFlyer={isFlyer}
                        />
                      </div>
                    ) : null}

                    <div
                      className={`col-span-4 flex flex-col justify-center gap-4 sm:col-span-8 ${thumbSrc ? "lg:col-span-6" : "lg:col-span-9"
                        }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="eyebrow text-[var(--tone-muted)]">Program</p>
                          <span className="type-micro inline-flex h-5 shrink-0 items-center rounded-xs bg-[var(--tone-sun)] px-2 text-[var(--tone-on-sun)]">
                            {card.statusLabel}
                          </span>
                        </div>
                        <h3 className="type-title mt-1.5">
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

                    <div className="col-span-4 flex flex-col justify-center gap-2.5 border-t border-[var(--tone-rule)] pt-4 sm:col-span-8 lg:col-span-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                      {card.registrationUrl ? (
                        <Link href={card.registrationUrl} className="button-primary w-full justify-center">
                          Daftar kelas ini
                        </Link>
                      ) : whatsapp ? (
                        <a
                          href={whatsapp}
                          className="button-primary w-full justify-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Tanya admin
                        </a>
                      ) : null}
                      <Link
                        href={`/program/${encodeURIComponent(card.slug)}`}
                        className="button-secondary w-full justify-center bg-transparent"
                      >
                        Lihat detail program
                      </Link>
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
