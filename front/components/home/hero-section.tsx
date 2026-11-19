import Image from "next/image";
import type { HomeData, HomeMedia } from "@/lib/home-data";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Accent } from "./ui/accent";
import { MoreLink } from "./ui/more-link";

function Photo({
  media,
  preload = false,
  lazy = false,
  sizes,
  className = "",
}: {
  media: HomeMedia;
  preload?: boolean;
  lazy?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)] ${className}`}
    >
      <Image
        fill
        preload={preload}
        loading={lazy ? "lazy" : undefined}
        src={media.src}
        alt={media.alt}
        quality={85}
        sizes={sizes}
        unoptimized={media.src.startsWith("/api/media/") || media.src.includes(".supabase.co/")}
        placeholder={media.blurDataURL ? "blur" : "empty"}
        blurDataURL={media.blurDataURL ?? undefined}
        className="object-cover"
      />
    </div>
  );
}

export function HeroSection({
  hero,
  moments,
  whatsappHref,
}: {
  hero: HomeData["hero"];
  moments: HomeMedia[];
  whatsappHref?: string | null;
}) {
  const side = moments[2] ?? null;
  const hasBatch = Boolean(hero.nextBatch);
  const hasSideColumn = Boolean(side || hero.nextBatch);

  return (
    <section
      id="beranda"
      aria-labelledby="hero-title"
      className="tone-mist relative w-full overflow-hidden border-b border-[var(--tone-rule)] bg-[#0d1829] sm:flex sm:min-h-[100dvh] sm:items-center sm:bg-[var(--tone-bg)] sm:py-14 lg:py-16"
    >
      {/* Mobile full-bleed photo background + brush gelap */}
      {hero.photo ? (
        <div className="absolute inset-0 sm:hidden" aria-hidden="true">
          <Image
            fill
            preload
            src={hero.photo.src}
            alt=""
            quality={85}
            sizes="100vw"
            unoptimized={hero.photo.src.startsWith("/api/media/") || hero.photo.src.includes(".supabase.co/")}
            placeholder={hero.photo.blurDataURL ? "blur" : "empty"}
            blurDataURL={hero.photo.blurDataURL ?? undefined}
            className="object-cover object-center"
          />
        </div>
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,15,28,0.72)_0%,rgba(7,15,28,0.12)_38%,rgba(7,15,28,0.58)_62%,rgba(7,15,28,0.94)_100%)] sm:hidden"
      />

      <div className="home-container relative z-10">
        <div className="home-grid items-center gap-y-8 lg:gap-x-10 xl:gap-x-12">
          <div className="col-span-4 flex min-h-[100dvh] flex-col justify-between pt-7 pb-10 sm:col-span-8 sm:min-h-0 sm:items-start sm:justify-start sm:py-0 lg:col-span-5">
            <div className="flex flex-wrap items-center gap-3.5 sm:mb-8 sm:gap-4">
              <span
                className="academy-hero-logo-blue hidden aspect-[120/46] h-8 sm:block sm:h-9 dark:hidden"
                role="img"
                aria-label="Albana Speech Academy"
              />
              <BrandLogo
                src="/logo-white.png"
                imageClassName="object-contain"
                sizes="104px"
                priority={false}
                className="block h-8 sm:hidden sm:h-9 dark:block"
              />
              <span className="h-5 w-px bg-white/30 sm:h-6 sm:bg-[var(--tone-rule)]" aria-hidden="true" />
              <p className="eyebrow text-white/85 sm:text-[var(--tone-muted)]">
                Kelas public speaking · Bandung
              </p>
            </div>

            <div className="mt-auto flex w-full flex-col items-start pt-16 sm:mt-0 sm:pt-0">
              <h1
                id="hero-title"
                className="type-display max-w-[18ch] text-balance text-white max-sm:text-[1.55rem] max-sm:leading-[1.15] max-sm:[text-shadow:0_2px_14px_rgba(7,15,28,0.9)] sm:text-[var(--tone-ink)] [&_.accent-italic]:text-[#9cc4ee] sm:[&_.accent-italic]:text-[var(--tone-accent)]"
              >
                Lebih percaya diri saat <Accent>menyampaikan ide</Accent>.
              </h1>

              <p className="type-lead mt-2.5 max-w-[40ch] text-pretty text-white/95 max-sm:text-[13px] max-sm:leading-[1.55] max-sm:[text-shadow:0_1px_10px_rgba(7,15,28,0.9)] sm:mt-5 sm:max-w-[44ch] sm:text-[var(--tone-muted)]">
                Latih cara membuka presentasi, menjelaskan ide, dan menjawab
                pertanyaan. Praktik langsung di kelas, dapatkan masukan dari
                trainer, lalu coba lagi.
              </p>

              <div className="mt-5 flex w-full flex-wrap items-center gap-x-6 gap-y-2 sm:mt-7 sm:w-auto">
                <a
                  href={hasBatch ? "#jadwal" : "#program"}
                  className="button-primary hero-button-primary px-6 max-sm:w-full max-sm:justify-center max-sm:border-white max-sm:bg-white max-sm:text-[#26599A] max-sm:hover:bg-white/90"
                >
                  {hasBatch ? "Lihat jadwal dan biaya" : "Jelajahi program"}
                </a>
                {whatsappHref ? (
                  <span className="hidden sm:inline-flex">
                    <MoreLink href={whatsappHref}>Tanya admin</MoreLink>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="col-span-4 hidden grid-cols-5 gap-3 self-start sm:col-span-8 sm:grid sm:gap-4 lg:col-span-7">
            {hero.photo ? (
              <Photo
                media={hero.photo}
                preload
                sizes={
                  hasSideColumn
                    ? "(min-width: 1280px) 420px, (min-width: 1024px) 35vw, (min-width: 640px) 56vw, calc(100vw - 2rem)"
                    : "(min-width: 1280px) 720px, (min-width: 1024px) 58vw, calc(100vw - 2rem)"
                }
                className={
                  hasSideColumn
                    ? "col-span-5 aspect-[4/5] sm:order-1 sm:col-span-3 sm:aspect-[3/4]"
                    : "col-span-5 aspect-[4/5] sm:order-1 sm:col-span-5 sm:aspect-[4/3] sm:max-h-[30rem]"
                }
              />
            ) : (
              // Belum ada foto dokumentasi: tampilkan tanda merek, bukan kotak kosong.
              <div
                className={
                  hasSideColumn
                    ? "col-span-5 flex aspect-[4/5] items-center justify-center rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)] sm:order-1 sm:col-span-3 sm:aspect-[3/4]"
                    : "col-span-5 flex aspect-[4/5] items-center justify-center rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)] sm:order-1 sm:col-span-5 sm:aspect-[4/3] sm:max-h-[30rem]"
                }
              >
                <span
                  role="img"
                  aria-label="Albana Speech Academy"
                  className="academy-hero-logo-blue block aspect-[120/46] w-1/2 opacity-90 dark:bg-[var(--tone-ink)]"
                />
              </div>
            )}

            {hasSideColumn ? (
              <div className="hidden flex-col gap-3 sm:order-2 sm:col-span-2 sm:flex sm:gap-4">
                {side ? (
                  <Photo
                    media={side}
                    lazy
                    sizes="(min-width: 1280px) 272px, (min-width: 1024px) 23vw, 37vw"
                    className={
                      hasBatch
                        ? "hidden aspect-square sm:block"
                        : "hidden flex-1 aspect-[3/4] sm:block"
                    }
                  />
                ) : null}

                {hero.nextBatch ? (
                  <div className="hero-anim-bento flex flex-1 flex-col justify-between gap-4 rounded-xs border border-white/10 bg-[var(--color-accent-strong)] p-5 text-white sm:gap-6 sm:p-6">
                    <p className="eyebrow text-white/75">Kelas berikutnya</p>
                    <div className="flex flex-col gap-1.5">
                      <p className="type-title leading-snug text-white">
                        {hero.nextBatch.programTitle}
                      </p>
                      <p className="text-base font-semibold text-white/95">
                        Mulai {hero.nextBatch.firstDateLabel}
                      </p>
                      <p className="type-small mt-1 border-t border-white/15 pt-2.5 text-white/80">
                        {hero.nextBatch.batchName} · {hero.nextBatch.statusLabel}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
