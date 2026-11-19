import Link from "next/link";
import type { HomeData } from "@/lib/home-data";
import { readProgramShowcase } from "@/lib/server/program-showcase";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { RetryButton } from "@/components/ui/retry-button";
import { SectionIntro } from "./section-intro";
import { SkeletonImage } from "./skeleton-image";
import { Accent } from "./ui/accent";
import { Tile } from "./ui/tile";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

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
          eyebrow="09 · Jadwal dan biaya"
          title={
            <>
              Pilih batch, <Accent>tandai kalendermu</Accent>
            </>
          }
          titleId="jadwal-title"
          description="Pilih batch yang cocok dengan kalendermu. Semua tanggal, jam, tempat, dan biaya ada di sini."
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
                  <article data-motion="rise" className="home-grid gap-y-6">
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
                      className={`col-span-4 flex flex-col gap-4 sm:col-span-8 ${thumb ? "lg:col-span-5" : "lg:col-span-8"
                        }`}
                    >
                      <div>
                        <p className="eyebrow text-[var(--tone-muted)]">Program</p>
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

                    <div className="col-span-4 flex flex-col justify-between gap-4 border-t border-[var(--tone-rule)] pt-4 sm:col-span-8 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                      <div>
                        <span className="type-micro inline-flex h-5 items-center rounded-xs bg-[var(--tone-sun)] px-1.5 text-[var(--tone-on-sun)]">
                          {card.statusLabel}
                        </span>
                        <p className="eyebrow mt-4 text-[var(--tone-muted)]">Biaya</p>
                        {card.batch!.normalPriceIdr ? (
                          <p className="type-small mt-1 line-through tabular-nums text-[var(--tone-muted)]">
                            {rupiah(card.batch!.normalPriceIdr)}
                          </p>
                        ) : null}
                        <p className="type-title mt-1 tabular-nums">
                          {card.batch!.priceIdr ? rupiah(card.batch!.priceIdr) : "-"}
                        </p>
                      </div>

                      <div>
                        {card.registrationUrl ? (
                          <Link href={card.registrationUrl} className="button-primary">
                            Daftar kelas ini
                          </Link>
                        ) : whatsapp ? (
                          <a
                            href={whatsapp}
                            className="button-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Tanya admin
                          </a>
                        ) : null}
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
