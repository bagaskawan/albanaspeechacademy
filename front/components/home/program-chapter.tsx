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
    <section id="program" className="section tone-canvas" aria-labelledby="program-title">
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
          <div className="flex items-baseline justify-between gap-4 border-b border-[var(--tone-rule)] pb-4">
            <h3 className="type-mega" data-motion="chapter">
              Public <br className="sm:hidden" />
              Training
            </h3>
            {programs !== "failed" ? (
              <p className="eyebrow shrink-0">{String(programs.length).padStart(2, "0")} program</p>
            ) : null}
          </div>

          {programs === "failed" ? (
            <div className="mt-6 border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-6 md:p-8" aria-live="polite">
              <p className="text-[var(--tone-muted)]">Program belum bisa dimuat.</p>
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
