import { Building2, CreditCard, FileCheck2, Scale, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionIntro } from "./section-intro";

const LEGAL_DOCUMENTS = [
  {
    icon: Scale,
    title: "Akta Pendirian CV",
    number: "Nomor 03 · 20 Januari 2026",
    issuer: "Notaris & PPAT Alfian Faudi Mukdas, S.H., M.Kn.",
    detail: "Pendirian Perseroan Komanditer CV Asa Albana sebagai badan hukum penyelenggara pelatihan.",
  },
  {
    icon: Building2,
    title: "Nomor Induk Berusaha (NIB)",
    number: "2701260111907",
    issuer: "Kementerian Investasi / BKPM (OSS)",
    detail: "Perizinan berusaha berbasis risiko diterbitkan 27 Januari 2026 atas nama CV Asa Albana.",
  },
  {
    icon: FileCheck2,
    title: "Surat Keterangan Terdaftar",
    number: "S-02859/SKT-WPJ.09/KPP.0903/2026",
    issuer: "KPP Pratama Bandung Cibeunying",
    detail: "Terdaftar resmi sejak 22 Januari 2026 untuk administrasi perpajakan badan usaha.",
  },
  {
    icon: CreditCard,
    title: "NPWP Badan",
    number: "1000 0000 0799 0364",
    issuer: "a.n. ASA ALBANA · Kota Bandung",
    detail: "Jl. Diponegoro No. 61, Cihaur Geulis, Cibeunying Kaler, Kota Bandung, Jawa Barat.",
  },
] as const;

export function LegalitySection() {
  return (
    <section
      id="legalitas"
      className="section bg-white text-[#10243F] transition-colors dark:bg-[#0D1829] dark:text-[#F0F5FA]"
      aria-labelledby="legalitas-title"
    >
      <Container className="max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
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

          <div
            data-motion="rise"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#DCEBFA] px-4 py-2 text-sm font-semibold text-[#10243F] dark:bg-[#1F3A5F] dark:text-[#E6F0FA]"
          >
            <ShieldCheck className="size-4 text-[#26599A] dark:text-[#7EB3F5]" aria-hidden="true" />
            <span>Dokumen legal terverifikasi</span>
          </div>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEGAL_DOCUMENTS.map((doc) => {
            const Icon = doc.icon;
            return (
              <li
                key={doc.title}
                data-motion="rise"
                className="flex flex-col justify-between rounded-2xl bg-[#F3F7FC] p-6 transition-colors dark:bg-[#132238]"
              >
                <div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#26599A] dark:bg-[#1C3557] dark:text-[#7EB3F5]">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">
                    {doc.title}
                  </h3>
                  <p className="mt-2 font-mono text-xs font-semibold tracking-tight text-[#26599A] tabular-nums break-all dark:text-[#7EB3F5]">
                    {doc.number}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#47607D] dark:text-[#A3B8D0]">
                    {doc.detail}
                  </p>
                </div>

                <p className="mt-5 border-t border-[#D8E4F0] pt-3 text-xs font-medium text-[#47607D] dark:border-[#233856] dark:text-[#A3B8D0]">
                  {doc.issuer}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
