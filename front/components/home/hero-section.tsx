import { SectionRail } from "@/components/layout/section-rail";
import { BrandLogo } from "@/components/layout/brand-logo";

export function HeroSection() {
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <BrandLogo className="mx-auto mb-6 h-16 w-40 md:h-20 md:w-52" imageClassName="object-contain" />
      <h1 className="hero-title" id="hero-title">
        <span>Albana</span>{" "}<span className="hero-emphasis">Speech</span>{" "}<span>Academy</span>
      </h1>
      <div className="hero-details">
        <p>
          Ingin lebih percaya diri saat semua mata tertuju kepadamu? Pilih latihan yang sesuai
          dengan tujuanmu, lalu praktikkan cara membuka presentasi, menyampaikan gagasan,
          dan menjawab pertanyaan.
        </p>
        <div className="hero-actions">
          <a className="button-primary" href="#program-pilihan">Cek Program</a>
          <a className="button-secondary" href="#cara-ngajar">Pelajari Metode</a>
        </div>
      </div>
      <SectionRail />
      <a href="#alan" className="hero-scroll">
        <svg aria-hidden="true" width="20" height="26" viewBox="0 0 20 26" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="2" y="1" width="16" height="23" rx="8" /><path d="M10 5v6" />
        </svg>
        Gulir
      </a>
    </section>
  );
}
