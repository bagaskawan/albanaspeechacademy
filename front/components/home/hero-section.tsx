import { SectionRail } from "@/components/layout/section-rail";
import { BrandLogo } from "@/components/layout/brand-logo";
import Image from "next/image";

export function HeroSection() {
  return (
    <section id="hero" className="hero academy-home-hero" aria-labelledby="hero-title">
      <div className="academy-hero-layout">
        <div className="academy-hero-copy">
          <BrandLogo className="mb-8 h-16 w-40 md:h-20 md:w-52" imageClassName="object-contain" />
          <h1 className="hero-title" id="hero-title">
            <span>Albana</span>{" "}<span className="hero-emphasis">Speech</span>{" "}<span>Academy</span>
          </h1>
          <div className="hero-details">
            <p>Saat tim menunggu usulanmu, bagaimana kamu memulai? Di kelas public speaking ini, kamu berlatih membuka presentasi, menjelaskan pilihan, dan menjawab pertanyaan di depan orang lain.</p>
            <div className="hero-actions">
              <a className="button-primary" href="#jadwal">Lihat jadwal</a>
              <a className="button-secondary" href="#cara-ngajar">Lihat cara mengajar</a>
            </div>
            <p className="academy-hero-focus">Presentasi · Diskusi · MC</p>
          </div>
        </div>
        <figure className="academy-hero-media">
          <div className="academy-hero-image">
            <Image src="/images/preview/praktik-berbicara.jpg" alt="Contoh visual suasana latihan berbicara, bukan dokumentasi kelas Albana" fill priority sizes="(min-width: 1024px) 54vw, 100vw" className="object-cover" />
          </div>
          <figcaption>Contoh visual — bukan dokumentasi kelas Albana</figcaption>
        </figure>
      </div>
      <SectionRail />
      <a href="#program-pilihan" className="hero-scroll">
        <svg aria-hidden="true" width="20" height="26" viewBox="0 0 20 26" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="2" y="1" width="16" height="23" rx="8" /><path d="M10 5v6" />
        </svg>
        Gulir
      </a>
    </section>
  );
}
