import { RetryButton } from "@/components/ui/retry-button";
import type { HomeData } from "@/lib/home-data";
import { InhouseTrainingSection } from "./inhouse-training-section";
import { ProgramMobileTracker } from "./program-mobile-tracker";
import { ProgramStorySection } from "./program-story-section";
import { SectionIntro } from "./section-intro";
import { Accent } from "./ui/accent";

export function ProgramChapter({
  programs,
  inhouse,
}: {
  programs: HomeData["programs"];
  inhouse: HomeData["inhouse"];
}) {
  return (
    <>
      <section id="program" className="tone-canvas home-section pt-12 sm:pt-16 lg:pt-20" aria-labelledby="program-title">
        <div className="home-container home-stack-head">
          <SectionIntro
            eyebrow="02 · Program"
            titleId="program-title"
            title={
              <>
                Setiap situasi bicara butuh <Accent>latihan yang berbeda.</Accent>
              </>
            }
            description="Mulai dari jalur yang paling dekat dengan kebutuhanmu hari ini. Setiap kelas dibuka dengan praktik dan ditutup dengan masukan langsung dari trainer."
            action={{ href: "#jadwal", label: "Bandingkan jadwal" }}
          />

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--tone-ink)] pb-4">
              <h3 className="type-title">Public Training</h3>
              <p className="type-small text-[var(--tone-muted)]">
                Kelas terjadwal, kamu berlatih bersama peserta lain.
              </p>
            </div>

            {programs === "failed" ? (
              <div className="py-12" aria-live="polite">
                <p className="type-body text-[var(--tone-muted)]">Program belum bisa dimuat.</p>
                <RetryButton />
              </div>
            ) : (
              <div>
                <ProgramMobileTracker
                  items={programs.map((p) => ({
                    slug: p.card.slug,
                    title: p.card.title,
                  }))}
                />
                {programs.map((program, index) => (
                  <ProgramStorySection key={program.card.slug} program={program} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <InhouseTrainingSection inhouse={inhouse} />
    </>
  );
}
