import type { CSSProperties } from "react";
import { Container } from "@/components/layout/container";
import { CountUp } from "@/components/ui/count-up";
import { countDurationMs } from "@/lib/motion";
import { academyRequest } from "@/lib/server/academy-api";
import { SectionIntro } from "./section-intro";

const learningApproaches = [
  {
    percentage: 70,
    title: "Praktik dan simulasi.",
    description:
      "Coba berbicara, presentasi, atau memainkan peran sesuai materi pelatihan.",
  },
  {
    percentage: 20,
    title: "Coaching dan feedback.",
    description: "Tinjau penampilan melalui masukan trainer dan sesama peserta.",
  },
  {
    percentage: 10,
    title: "Konsep dan kerangka.",
    description: "Pelajari prinsip dan alat komunikasi yang mendukung praktik.",
  },
] as const;

export async function LearningMethodSection() {
  let method: string | null = null;
  try {
    const rows = await academyRequest("academy?select=teaching_method&id=eq.1");
    if (Array.isArray(rows) && typeof rows[0]?.teaching_method === "string") method = rows[0].teaching_method;
  } catch { /* Existing public description stays readable. */ }
  const showBreakdown = !method || method === "70% praktik dan simulasi, 20% coaching dan feedback, 10% konsep dan kerangka.";
  return (
    <section
      id="cara-ngajar"
      className="section bg-panel-soft"
      aria-labelledby="cara-ngajar-title"
    >
      <Container className="max-w-5xl">
        <SectionIntro
          className="max-w-[42rem]"
          description={method ?? "Sebagian besar waktu belajar dipakai untuk praktik dan simulasi, lalu ditajamkan lewat coaching, feedback, dan kerangka komunikasi."}
          eyebrow="Cara belajar"
          title="Kemampuan bicara tumbuh saat benar-benar dipraktikkan"
          titleId="cara-ngajar-title"
        />

        {showBreakdown ? <ol className="mt-8 list-none border-t border-control">
          {learningApproaches.map((item) => (
            <li
              key={item.title}
              className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-3 border-b border-control py-5 md:grid-cols-[7rem_1fr_1fr] md:gap-x-8 md:py-6"
            >
              <CountUp
                className="font-display text-3xl font-semibold tracking-tight tabular-nums text-accent md:text-5xl"
                value={item.percentage}
                suffix="%"
              />
              <h3 className="text-xl leading-tight font-semibold tracking-tight md:text-2xl">
                {item.title}
              </h3>
              <p className="col-span-2 leading-relaxed text-muted md:col-span-1">
                {item.description}
              </p>
              <div aria-hidden="true" className="col-span-full h-1.5 bg-card">
                <div
                  className="method-measure h-full bg-accent"
                  style={
                    {
                      width: `${item.percentage}%`,
                      "--duration-count": `${countDurationMs(item.percentage)}ms`,
                    } as CSSProperties
                  }
                />
              </div>
            </li>
          ))}
        </ol> : null}
      </Container>
    </section>
  );
}
