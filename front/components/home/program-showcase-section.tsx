import { Container } from "@/components/layout/container";
import { RetryButton } from "@/components/ui/retry-button";
import { readProgramShowcase } from "@/lib/server/program-showcase";
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
        <p className="eyebrow">Program pilihan</p>
        <p className="mt-3 text-muted">
          Data program sedang tidak tersedia. Coba muat ulang sebentar lagi.
        </p>
        <RetryButton />
      </div>
    );
  }

  if (showcase.cards.length === 0) {
    return (
      <div className="mt-8 rounded-panel border border-rule bg-card p-6 md:p-8">
        <p className="eyebrow">Program pilihan</p>
        <p className="mt-3 text-muted">
          Belum ada program yang bisa ditampilkan saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
      {showcase.cards.map((card, index) => (
        <ProgramCardView key={card.slug} card={card} index={index} />
      ))}
    </div>
  );
}

export function ProgramShowcaseSection() {
  return (
    <section
      id="program-pilihan"
      className="section"
      aria-labelledby="program-pilihan-title"
    >
      <Container className="max-w-5xl" id="jadwal">
        <SectionIntro
          description="Bandingkan fokus latihan, materi, dan jadwal yang tersedia sebelum menentukan program."
          eyebrow="Pilih langkahmu"
          title="Mulai dari program yang paling dekat dengan tujuanmu"
          titleId="program-pilihan-title"
        />
        <ProgramShowcaseContent />
      </Container>
    </section>
  );
}
