import { Container } from "@/components/layout/container";
import { SectionIntro } from "./section-intro";

const LEGAL_DOCUMENTS = [
  {
    title: "Akta Pendirian CV",
    number: "Nomor 03 · 20 Januari 2026",
    issuer: "Notaris & PPAT Alfian Faudi Mukdas, S.H., M.Kn.",
    detail: "Pendirian Perseroan Komanditer CV Asa Albana sebagai badan hukum penyelenggara pelatihan.",
  },
  {
    title: "Nomor Induk Berusaha (NIB)",
    number: "2701260111907",
    issuer: "Kementerian Investasi / BKPM (OSS)",
    detail: "Perizinan berusaha berbasis risiko diterbitkan 27 Januari 2026 atas nama CV Asa Albana.",
  },
  {
    title: "Surat Keterangan Terdaftar",
    number: "S-02859/SKT-WPJ.09/KPP.0903/2026",
    issuer: "KPP Pratama Bandung Cibeunying",
    detail: "Terdaftar resmi sejak 22 Januari 2026 untuk administrasi perpajakan badan usaha.",
  },
  {
    title: "NPWP Badan",
    number: "1000 0000 0799 0364",
    issuer: "a.n. ASA ALBANA · Kota Bandung",
    detail: "Jl. Diponegoro No. 61, Cihaur Geulis, Cibeunying Kaler, Kota Bandung, Jawa Barat.",
  },
] as const;

export function LegalitySection() {
  return (
    <section id="legalitas" className="section tone-canvas" aria-labelledby="legalitas-title">
      <Container className="max-w-7xl">
        <SectionIntro
          eyebrow="[ LEGALITAS LEMBAGA ]"
          title={
            <>
              Resmi terdaftar di bawah <em className="accent-serif">CV Asa Albana</em>
            </>
          }
          titleId="legalitas-title"
          description="Seluruh program pelatihan publik maupun kerja sama inhouse diselenggarakan secara legal dan siap memenuhi kebutuhan administrasi instansi atau perusahaan."
        />
        <p data-motion="rise" className="eyebrow mt-8">Dokumen legal terverifikasi</p>
        <ul className="mt-3 border-b border-[var(--tone-rule)]">
          {LEGAL_DOCUMENTS.map((doc) => (
            <li key={doc.title} data-motion="rise" className="grid gap-1 border-t border-[var(--tone-rule)] py-5 md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="type-title">{doc.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--tone-muted)]">{doc.detail}</p>
              </div>
              <div className="md:text-right">
                <p className="font-mono text-sm font-semibold tabular-nums break-all text-[var(--tone-accent)]">{doc.number}</p>
                <p className="mt-1 text-sm text-[var(--tone-muted)]">{doc.issuer}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
