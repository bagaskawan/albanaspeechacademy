import { BrandLogo } from "@/components/layout/brand-logo";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";

const previewImages = [
  "/images/preview/praktik-berbicara.jpg",
  "/images/preview/diskusi-kelompok.jpg",
  "/images/preview/simulasi-panggung.jpg",
  "/images/preview/suasana-kelas.jpg",
  "/images/preview/latihan-mc.jpg",
  "/images/preview/umpan-balik-trainer.jpg",
] as const;

export function HeroSection() {
  return (
    <AnimatedMarqueeHero
      tagline="Presentasi · Diskusi · MC"
      title={<>
        <span className="academy-hero-logo-blue block aspect-[120/46] w-full dark:hidden" role="img" aria-label="Albana Speech Academy" />
        <BrandLogo src="/logo-white.png" sizes="(min-width: 768px) 340px, 256px" className="hidden w-full dark:block" imageClassName="object-contain" />
      </>}
      description="Saat tim menunggu usulanmu, bagaimana kamu memulai? Di kelas public speaking ini, kamu berlatih membuka presentasi, menjelaskan pilihan, dan menjawab pertanyaan di depan orang lain."
      ctaText="Lihat jadwal"
      ctaHref="#jadwal"
      images={previewImages}
    />
  );
}
