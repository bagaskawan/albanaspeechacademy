import type { HomeLegality } from "@/lib/home-data";
import { LegalityRegistry, type LegalDocumentItem } from "./legality-registry";
import { SectionIntro } from "./section-intro";
import { Accent } from "./ui/accent";

const LEGAL_DOCUMENTS: readonly LegalDocumentItem[] = [
  { key: "akta", title: "Akta Pendirian CV", number: "Nomor 03 · 20 Januari 2026", issuer: "Notaris & PPAT Alfian Faudi Mukdas, S.H., M.Kn." },
  { key: "nib", title: "Nomor Induk Berusaha (NIB)", number: "2701260111907", issuer: "Kementerian Investasi / BKPM (OSS)" },
  { key: "skt", title: "Surat Keterangan Terdaftar", number: "S-02859/SKT-WPJ.09/KPP.0903/2026", issuer: "KPP Pratama Bandung Cibeunying" },
  { key: "npwpFront", title: "NPWP Badan", number: "1000 0000 0799 0364", issuer: "a.n. ASA ALBANA · Kota Bandung" },
];

export function LegalitySection({ legality }: { legality: HomeLegality }) {
  return (
    <section id="legalitas" className="tone-mist home-section" aria-labelledby="legalitas-title">
      <div className="home-container home-stack-head">
        <SectionIntro
          eyebrow="06 · Legalitas"
          titleId="legalitas-title"
          title={
            <>
              Resmi terdaftar di bawah <Accent>CV Asa Albana.</Accent>
            </>
          }
          description="Mengajukan pelatihan untuk instansi butuh lembaga yang jelas. Dokumen ini bisa kamu cek sebelum bekerja sama."
        />

        <LegalityRegistry documents={LEGAL_DOCUMENTS} legality={legality} />
      </div>
    </section>
  );
}
