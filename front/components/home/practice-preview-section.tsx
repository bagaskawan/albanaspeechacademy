import Image from "next/image";
import { Container } from "@/components/layout/container";
import { SectionIntro } from "./section-intro";

const previews = [
  { src: "/images/preview/simulasi-panggung.jpg", alt: "Contoh visual simulasi berbicara di depan audiens" },
  { src: "/images/preview/diskusi-kelompok.jpg", alt: "Contoh visual diskusi dan umpan balik kelompok" },
] as const;

export function PracticePreviewSection() {
  return (
    <section className="section" aria-labelledby="proses-title">
      <Container className="max-w-7xl">
        <SectionIntro eyebrow="Proses latihan" title="Belajar dimulai saat kamu mencoba" titleId="proses-title" description="Dari mencoba berbicara hingga menerima masukan, setiap sesi memberi ruang untuk berlatih." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {previews.map((preview) => (
            <figure key={preview.src} className="m-0">
              <div className="relative aspect-[4/3] overflow-hidden bg-panel-soft">
                <Image src={preview.src} alt={`${preview.alt}; bukan dokumentasi kelas Albana`} fill sizes="(min-width: 768px) 48vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-xs text-muted">Contoh visual — bukan dokumentasi kelas Albana</figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
