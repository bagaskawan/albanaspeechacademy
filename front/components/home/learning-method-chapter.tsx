import type { HomeMedia } from "@/lib/home-data";
import { SectionIntro } from "./section-intro";
import { SkeletonImage } from "./skeleton-image";
import { Accent } from "./ui/accent";

const approaches = [
  {
    value: 80,
    title: "Praktik & simulasi",
    description: "Praktik langsung, simulasi panggung, role play MC dan pembicara, serta presentasi kasus nyata.",
    caption: "Praktik di depan peserta lain",
  },
  {
    value: 20,
    title: "Coaching, konsep & feedback",
    description: "Evaluasi performa pribadi, masukan langsung dari trainer, dan kerangka komunikasi yang merapikan pesan.",
    caption: "Masukan langsung dari trainer",
  },
] as const;

const levels = [
  ["Fundamental", "membangun percaya diri"],
  ["Professional", "komunikasi efektif"],
  ["Advance", "performa panggung"],
  ["Expert", "pembicara dan fasilitator"],
] as const;

export function LearningMethodChapter({ moments }: { moments: HomeMedia[] }) {
  return (
    <section id="cara-ngajar" className="tone-canvas home-section" aria-labelledby="cara-ngajar-title">
      <div className="home-container home-stack-head">
        <SectionIntro
          eyebrow="05 · Cara belajar"
          titleId="cara-ngajar-title"
          title={
            <>
              Kemampuan bicara tumbuh saat <Accent>benar-benar dipraktikkan.</Accent>
            </>
          }
          description="80% praktik dan simulasi, 20% coaching, konsep, dan feedback."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {approaches.map((item, index) => {
            const photo = moments[index];
            return (
              <article
                key={item.value}
                data-motion="rise"
                className="flex flex-col justify-between gap-6 rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-6 sm:p-8"
              >
                <div>
                  <p className="type-mega tabular-nums leading-none">
                    <span data-motion="count" data-value={item.value}>{item.value}%</span>
                  </p>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--tone-tile)]">
                    <div
                      data-motion="bar"
                      className="h-full origin-left rounded-full bg-[var(--tone-sun)]"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <h3 className="type-title mt-5">{item.title}</h3>
                  <p className="type-body mt-2 text-[var(--tone-muted)] text-pretty">{item.description}</p>
                </div>

                {photo ? (
                  <figure className="mt-auto">
                    <div data-motion="media" className="relative aspect-[16/10] overflow-hidden rounded-xs bg-[var(--tone-tile)]">
                      <SkeletonImage src={photo.src} alt="" fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" />
                    </div>
                    <figcaption className="type-small mt-2 text-[var(--tone-muted)]">{item.caption}</figcaption>
                  </figure>
                ) : null}
              </article>
            );
          })}
        </div>

        <div>
          <p className="type-label text-[var(--tone-muted)]">Kerangka pengembangan</p>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {levels.map(([title, description], index) => (
              <li key={title} data-motion="slide" className="flex flex-col gap-2 border-l-2 border-[var(--tone-sun)] pl-4">
                <span className="type-small italic text-[var(--tone-muted)]">Tahap {index + 1}</span>
                <strong className="type-title">{title}</strong>
                <span className="type-small text-[var(--tone-muted)]">{description}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
