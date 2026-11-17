import { Container } from "@/components/layout/container";
import { RetryButton } from "@/components/ui/retry-button";
import type { HomeData } from "@/lib/home-data";
import { InhouseTrainingSection } from "./inhouse-training-section";
import { ProgramStorySection } from "./program-story-section";
import { SectionIntro } from "./section-intro";

export function ProgramChapter({
  programs,
  inhouse,
}: {
  programs: HomeData["programs"];
  inhouse: HomeData["inhouse"];
}) {
  return (
    <section id="program" className="section" aria-labelledby="program-title">
      <Container className="max-w-7xl">
        <SectionIntro
          eyebrow="[ PROGRAM ]"
          title={
            <>
              Setiap situasi bicara butuh{" "}
              <em className="accent-serif">latihan yang berbeda</em>
            </>
          }
          titleId="program-title"
          description="Mempresentasikan gagasan, memandu acara, atau melatih tim — mulai dari situasi yang paling dekat dengan kebutuhanmu."
        />

        <div className="mt-12">
          <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
            Public Training
          </h3>

          {programs === "failed" ? (
            <div className="mt-6 rounded-panel border border-rule bg-card p-6 md:p-8" aria-live="polite">
              <p className="text-muted">Program belum bisa dimuat.</p>
              <RetryButton />
            </div>
          ) : (
            <div className="mt-6">
              {programs.map((program, index) => (
                <ProgramStorySection key={program.card.slug} program={program} index={index} />
              ))}
            </div>
          )}
        </div>

        <InhouseTrainingSection inhouse={inhouse} />
      </Container>
    </section>
  );
}
