import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import type { HomeData } from "@/lib/home-data";

export function HeroSection({ hero }: { hero: HomeData["hero"] }) {
  const enter = "motion-safe:animate-[academy-hero-enter_0.55s_ease-out_both]";

  return (
    <section id="beranda" aria-labelledby="hero-title" className="tone-canvas pt-6 md:pt-8">
      <Container className="max-w-7xl">
        <div
          className="tone-night relative min-h-[min(88svh,52rem)] overflow-hidden max-lg:min-h-[36rem]"
        >
          {hero.photo ? (
            <div data-motion="media" className="absolute inset-0 overflow-hidden">
              <Image
                fill
                preload
                src={hero.photo.src}
                alt={hero.photo.alt}
                sizes="(min-width:1280px) 1280px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
          {/* 0.60 at 55% (<lg) / 45% (lg+): lead text >= 4.5:1 on worst-case white pixel (5.05:1) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_top,rgb(7_15_28/0.88)_0%,rgb(7_15_28/0.60)_55%,transparent_90%)] lg:bg-[linear-gradient(to_top,rgb(7_15_28/0.88)_0%,rgb(7_15_28/0.60)_45%,transparent_75%)]"
          />

          <div className="absolute inset-x-0 bottom-0 max-w-[44rem] space-y-4 p-6 text-white md:p-12">
            <p className={`eyebrow !text-white ${enter}`}>Presentasi · Diskusi · MC</p>

            <h1
              id="hero-title"
              style={{ animationDelay: "0.08s" }}
              className={`w-[clamp(14rem,30vw,24rem)] ${enter}`}
            >
              <span role="img" aria-label="Albana Speech Academy" className="block">
                <BrandLogo
                  src="/logo-white.png"
                  sizes="(min-width: 768px) 384px, 224px"
                  className="w-full"
                  imageClassName="object-contain"
                />
              </span>
            </h1>

            <p
              style={{ animationDelay: "0.16s" }}
              className={`type-lead text-pretty text-white ${enter}`}
            >
              Saat tim menunggu usulanmu, bagaimana kamu memulai? Di kelas public speaking ini, kamu berlatih membuka presentasi, menjelaskan pilihan, dan menjawab pertanyaan di depan orang lain.
            </p>

            <a
              href="#jadwal"
              style={{ animationDelay: "0.24s" }}
              className={`inline-flex min-h-11 items-center gap-2 bg-white px-6 py-2.5 font-display text-sm font-semibold text-[var(--color-accent-strong)] transition-colors hover:bg-white/90 ${enter}`}
            >
              <span>Lihat jadwal</span>
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
