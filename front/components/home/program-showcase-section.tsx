import { Container } from "@/components/layout/container";
import { RetryButton } from "@/components/ui/retry-button";
import { readProgramShowcase } from "@/lib/server/program-showcase";
import { academyRequest } from "@/lib/server/academy-api";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import Link from "next/link";
import { ProgramCardView } from "./program-card";
import { SectionIntro } from "./section-intro";

async function ProgramShowcaseContent() {
  const showcase = await readProgramShowcase();

  if (showcase.status === "failed") {
    return (
      <div
        className="mt-8 rounded-panel border border-rule bg-card p-6 md:p-8"
        aria-live="polite"
      >
        <p className="mt-3 text-muted">Program belum bisa dimuat.</p>
        <RetryButton />
      </div>
    );
  }

  if (showcase.cards.length === 0) {
    return (
      <div className="mt-8 rounded-panel border border-rule bg-card p-6 md:p-8">
        <p className="eyebrow">Program pilihan</p>
        <p className="mt-3 text-muted">
          Program belum bisa dimuat.
        </p>
      </div>
    );
  }

  let whatsapp: string | undefined;
  let bundles: { speaker_program_slug: string; certification_program_slug: string }[] = [];
  try {
    const channel = (await readPublishedContacts()).find((item) => item.kind === "whatsapp");
    whatsapp = channel ? contactHref(channel) : undefined;
    const rows = await academyRequest("bundle_offers?select=speaker_program_slug,certification_program_slug&active=eq.true&placement_scope=eq.program");
    if (Array.isArray(rows)) bundles = rows as typeof bundles;
  } catch { /* The cards remain available without contacts or bundle notices. */ }
  const publicCards = showcase.cards.filter((card) => card.slug !== "inhouse-training");
  const inhouse = showcase.cards.find((card) => card.slug === "inhouse-training");
  return <>
    <h3 className="mt-8 text-xl font-semibold">Public Training</h3>
    <div className="mt-4 grid gap-5 lg:grid-cols-3">
      {publicCards.map((card, index) => {
        const bundle = bundles.find((item) => card.slug === item.speaker_program_slug || card.slug === item.certification_program_slug);
        const bundleNote = bundle ? card.slug === bundle.speaker_program_slug ? "Tersedia paket dengan Sertifikasi" : "Tersedia paket dengan Speaker" : undefined;
        return <ProgramCardView key={card.slug} card={card} index={index} bundleNote={bundleNote} />;
      })}
    </div>
    {inhouse ? <div data-motion="rise" className="mt-7 border-t border-rule pt-6">
      <h3 className="text-xl font-semibold">Inhouse Training</h3>
      <p className="mt-3 max-w-2xl text-muted">Pelatihan di tempat perusahaanmu. Materi, silabus, tanggal, dan waktu kami susun bersama timmu.</p>
      <div className="mt-5 flex flex-wrap gap-3">{whatsapp ? <a className="button-primary" href={whatsapp} target="_blank" rel="noopener noreferrer">Konsultasi via WhatsApp</a> : null}<Link className="button-secondary" href="/program/inhouse-training">Selengkapnya</Link></div>
    </div> : null}
  </>;
}

export function ProgramShowcaseSection() {
  return (
    <section
      id="program"
      className="section"
      aria-labelledby="program-pilihan-title"
    >
      <Container className="max-w-7xl">
        <SectionIntro
          description="Mempresentasikan gagasan, memandu acara, atau melatih tim — mulai dari situasi yang paling dekat dengan kebutuhanmu."
          eyebrow="[ PROGRAM ]"
          title={<>Setiap situasi bicara butuh <mark className="bg-highlight text-ink">latihan yang berbeda</mark></>}
          titleId="program-pilihan-title"
        />
        <ProgramShowcaseContent />
      </Container>
    </section>
  );
}
