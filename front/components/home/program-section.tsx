import { Container } from "@/components/layout/container";
import { SectionIntro } from "./section-intro";

const DUMMY_PROGRAM_AREAS = [
  "Public Speaking",
  "Professional Presentation",
  "MC & Event Communication",
  "Moderator & Host Training",
  "Leadership Communication",
  "Service Excellence",
  "Training of Trainer",
] as const;

export function ProgramSection() {
  return (
    <section
      id="program"
      className="section"
      aria-labelledby="program-title"
    >
      <Container grid className="max-w-5xl gap-y-8">
        <SectionIntro
          className="col-span-full md:col-span-4 lg:col-span-5"
          description="Ada saatnya kamu perlu mempresentasikan gagasan, memandu acara, atau menguatkan komunikasi tim. Mulai dari situasi yang paling dekat dengan kebutuhanmu."
          eyebrow="Ruang latihan"
          title="Setiap situasi bicara membutuhkan latihan yang berbeda"
          titleId="program-title"
        />

        <ol className="col-span-full list-none border-t border-control md:col-span-4 lg:col-span-6 lg:col-start-7">
          {DUMMY_PROGRAM_AREAS.map((area, index) => (
            <li
              key={area}
              className="flex items-baseline gap-5 border-b border-rule py-4"
            >
              <span aria-hidden="true" className="text-sm font-semibold tabular-nums text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">{area}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
