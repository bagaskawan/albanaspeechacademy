import Image from "next/image";
import type { HomeLegality } from "@/lib/home-data";
import { SectionIntro } from "./section-intro";
import { Accent } from "./ui/accent";

const LEGAL_DOCUMENTS = [
  { key: "akta", title: "Akta Pendirian CV", number: "Nomor 03 · 20 Januari 2026", issuer: "Notaris & PPAT Alfian Faudi Mukdas, S.H., M.Kn." },
  { key: "nib", title: "Nomor Induk Berusaha (NIB)", number: "2701260111907", issuer: "Kementerian Investasi / BKPM (OSS)" },
  { key: "skt", title: "Surat Keterangan Terdaftar", number: "S-02859/SKT-WPJ.09/KPP.0903/2026", issuer: "KPP Pratama Bandung Cibeunying" },
  { key: "npwpFront", title: "NPWP Badan", number: "1000 0000 0799 0364", issuer: "a.n. ASA ALBANA · Kota Bandung" },
] as const;

export function LegalitySection({ legality }: { legality: HomeLegality }) {
  return (
    <section id="legalitas" className="tone-mist home-section" aria-labelledby="legalitas-title">
      <div className="home-container home-stack-head">
        <SectionIntro
          eyebrow="06 — Legalitas"
          titleId="legalitas-title"
          title={
            <>
              Resmi terdaftar di bawah <Accent>CV Asa Albana.</Accent>
            </>
          }
          description="Mengajukan pelatihan untuk instansi butuh lembaga yang jelas. Dokumen ini bisa kamu cek sebelum bekerja sama."
        />

        <ul className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {LEGAL_DOCUMENTS.map((doc, index) => {
            const imageUrl = legality[doc.key];
            const backUrl = doc.key === "npwpFront" ? legality.npwpBack : null;
            return (
              <li key={doc.title} data-motion="rise" className="flex flex-col gap-4">
                {imageUrl ? (
                  <div className="flex flex-col gap-2">
                    <div data-motion="media" className="relative aspect-[3/4] overflow-hidden rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)]">
                      <Image
                        fill
                        src={imageUrl}
                        alt={doc.title}
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                        className="object-cover"
                      />
                    </div>
                    {backUrl ? (
                      <div className="relative aspect-[16/10] w-1/2 overflow-hidden rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)]">
                        <Image
                          fill
                          src={backUrl}
                          alt={`${doc.title} — tampak belakang`}
                          sizes="(min-width: 1024px) 11vw, 45vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-col gap-1 border-t border-[var(--tone-ink)] pt-4">
                  <span className="type-small italic text-[var(--tone-accent)]">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="type-title">{doc.title}</h3>
                  <p className="type-body tabular-nums break-all">{doc.number}</p>
                  <p className="type-small text-[var(--tone-muted)]">{doc.issuer}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
