import Image from "next/image";
import type { HomeMedia } from "@/lib/home-data";
import { academyRequest } from "@/lib/server/academy-api";
import { SectionIntro } from "./section-intro";
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

const defaultMethod = "80% praktik dan simulasi, 20% coaching, konsep, dan feedback.";

export async function LearningMethodChapter({ moments }: { moments: HomeMedia[] }) {
  let method: string | null = null;
  try {
    const rows = await academyRequest("academy?select=teaching_method&id=eq.1&limit=1");
    if (Array.isArray(rows) && typeof rows[0]?.teaching_method === "string") method = rows[0].teaching_method;
  } catch { /* Editorial copy remains available. */ }

  return (
    <section id="cara-ngajar" className="tone-canvas home-section" aria-labelledby="cara-ngajar-title">
      <div className="home-container home-stack-head">
        <SectionIntro
          eyebrow="05 — Cara belajar"
          titleId="cara-ngajar-title"
          title={
            <>
              Kemampuan bicara tumbuh saat <Accent>benar-benar dipraktikkan.</Accent>
            </>
          }
          description={
            method && method !== defaultMethod
              ? method
              : "Sebagian besar waktumu dipakai untuk berbicara, bukan mendengar. Masukan trainer menajamkannya; kerangka komunikasi merapikannya."
          }
        />

        <div className="flex flex-col">
          {approaches.map((item, index) => {
            const photo = moments[index];
            return (
              <div
                key={item.value}
                data-motion="rise"
                className="home-grid items-center gap-y-6 border-t border-[var(--tone-rule)] py-10 last:border-b"
              >
                <div className="col-span-4 sm:col-span-3 lg:col-span-3">
                  <p className="type-mega tabular-nums">
                    <span data-motion="count" data-value={item.value}>{item.value}%</span>
                  </p>
                  <div className="mt-4 h-1 bg-[var(--tone-tile)]">
                    <div data-motion="bar" className="h-full origin-left bg-[var(--tone-sun)]" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
                <div className="col-span-4 sm:col-span-5 lg:col-span-4">
                  <h3 className="type-title">{item.title}</h3>
                  <p className="type-body mt-3 text-[var(--tone-muted)] text-pretty">{item.description}</p>
                </div>
                {photo ? (
                  <figure className="col-span-4 sm:col-span-8 lg:col-span-4 lg:col-start-9">
                    <div data-motion="media" className="relative aspect-[4/3] overflow-hidden rounded-xs bg-[var(--tone-tile)]">
                      <Image src={photo.src} alt="" fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
                    </div>
                    <figcaption className="type-small mt-2 text-[var(--tone-muted)]">{item.caption}</figcaption>
                  </figure>
                ) : null}
              </div>
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
