import Image from "next/image";
import { BrandLogo } from "@/components/layout/brand-logo";
import type { HomeData, HomeMedia } from "@/lib/home-data";
import { Accent } from "./ui/accent";
import { MoreLink } from "./ui/more-link";

function Photo({
  media,
  preload = false,
  sizes,
  className = "",
}: {
  media: HomeMedia;
  preload?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      data-motion="media"
      className={`relative overflow-hidden rounded-xs bg-[var(--tone-tile)] ${className}`}
    >
      <Image
        fill
        preload={preload}
        src={media.src}
        alt={media.alt}
        quality={85}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}

export function HeroSection({
  hero,
  moments,
}: {
  hero: HomeData["hero"];
  moments: HomeMedia[];
}) {
  const enter = "motion-safe:animate-[academy-hero-enter_0.55s_ease-out_both]";
  const side = moments[10] ?? moments[0] ?? null;

  return (
    <section
      id="beranda"
      aria-labelledby="hero-title"
      className="tone-canvas border-b border-[var(--tone-rule)] py-12 lg:py-20"
    >
      <div className="home-container">
        <div className="home-grid items-center gap-y-10">
          <div className="col-span-4 flex flex-col items-start gap-6 sm:col-span-8 lg:col-span-6">
            <div className={`flex flex-wrap items-center gap-4 ${enter}`}>
              <span
                className="academy-hero-logo-blue block aspect-[120/46] h-9 dark:hidden"
                role="img"
                aria-label="Albana Speech Academy"
              />
              <BrandLogo
                src="/logo-white.png"
                imageClassName="object-contain"
                sizes="104px"
                className="hidden h-9 dark:block"
              />
              <span className="h-6 w-px bg-[var(--tone-rule)]" aria-hidden="true" />
              <p className="eyebrow text-[var(--tone-muted)]">
                Akademi Public Speaking · Bandung
              </p>
            </div>

            <h1
              id="hero-title"
              style={{ animationDelay: "0.09s" }}
              className={`type-display max-w-[16ch] text-balance ${enter}`}
            >
              Latih momen saat <Accent>semua mata</Accent> tertuju padamu.
            </h1>

            <div
              style={{ animationDelay: "0.18s" }}
              className={`flex flex-col items-start gap-6 ${enter}`}
            >
              <p className="type-lead max-w-[34em] text-[var(--tone-muted)] text-pretty">
                Rapat, presentasi, memandu acara, menjawab pertanyaan. <span className="highlight-stabilo">Di Albana kamu tidak sekadar belajar teori bicara kamu{" "}
                  berlatih di depan orang, menerima masukan, lalu mencoba lagi
                  sampai terbiasa</span>.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <a href="#jadwal" className="button-primary">
                  Lihat jadwal kelas
                </a>
                <MoreLink href="#kontak">Konsultasi dulu</MoreLink>
              </div>
            </div>
          </div>

          <div className="col-span-4 grid grid-cols-5 gap-2 self-start sm:col-span-8 lg:col-span-6">
            {hero.photo ? (
              <Photo
                media={hero.photo}
                preload
                sizes="(min-width: 1024px) 34vw, (min-width: 640px) 60vw, 100vw"
                className="col-span-5 aspect-[4/5] sm:col-span-3 sm:aspect-[3/4]"
              />
            ) : (
              // Belum ada foto dokumentasi: tampilkan tanda merek, bukan kotak kosong.
              <div className="col-span-5 flex aspect-[4/5] items-center justify-center rounded-xs bg-[var(--tone-tile)] sm:col-span-3 sm:aspect-[3/4]">
                <span
                  role="img"
                  aria-label="Albana Speech Academy"
                  className="academy-hero-logo-blue block aspect-[120/46] w-1/2 opacity-90 dark:bg-[var(--tone-ink)]"
                />
              </div>
            )}

            <div className="col-span-5 flex flex-col gap-2 sm:col-span-2">
              {side ? (
                <Photo
                  media={side}
                  sizes="(min-width: 1024px) 22vw, 40vw"
                  className="hidden aspect-square sm:block"
                />
              ) : null}

              <div className="flex flex-1 flex-col justify-between gap-4 rounded-xs bg-[var(--tone-sun)] p-4 text-[var(--tone-on-sun)] sm:p-6">
                <p className="eyebrow">Kelas berikutnya</p>
                {hero.nextBatch ? (
                  <div className="flex flex-col gap-1">
                    <p className="type-title leading-tight">{hero.nextBatch.programTitle}</p>
                    <p className="type-small">
                      {hero.nextBatch.batchName} · {hero.nextBatch.firstDateLabel}
                    </p>
                    <p className="type-small font-semibold">{hero.nextBatch.statusLabel}</p>
                  </div>
                ) : (
                  <p className="type-small">Jadwal kelas berikutnya belum tersedia.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
