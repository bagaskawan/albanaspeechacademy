import { CountUp } from "@/components/ui/count-up";
import { SectionIntro } from "./section-intro";
import { Accent } from "./ui/accent";

const benefits = [
  ["Lebih percaya diri", "saat semua mata tertuju padamu"],
  ["Presentasi lebih meyakinkan", "dari kalimat pertama"],
  ["Komunikasi kerja lebih efektif", "di rapat dan diskusi"],
  ["Tampil profesional", "saat mewakili tim atau organisasi"],
] as const;

/** Bab 01 · alasan berlatih. Angka hanya dari data atau naskah bersumber. */
export function BenefitBand({ programCount }: { programCount: number }) {
  const facts: Array<{
    key: string;
    label: string;
    num?: number;
    suffix?: string;
    text?: string;
  }> = [
    { key: "practice", num: 80, suffix: "%", label: "waktu kelas dipakai untuk praktik dan simulasi" },
    ...(programCount > 0
      ? [{ key: "programs", num: programCount, label: "jalur Public Training sesuai situasi bicaramu" }]
      : []),
    { key: "bnsp", text: "BNSP", label: "Master Trainer bersertifikat yang memimpin kelas" },
  ];

  return (
    <section aria-labelledby="alasan-title" className="tone-canvas home-section">
      <div className="home-container home-stack-head">
        <SectionIntro
          align="center"
          eyebrow="01 · Kenapa berlatih"
          titleId="alasan-title"
          title={
            <>
              Bicara di depan orang adalah keterampilan. <Accent>Keterampilan bisa dilatih.</Accent>
            </>
          }
          description="Kebanyakan orang tidak kekurangan ide, mereka kekurangan jam terbang. Kelas kami dirancang supaya kamu lebih banyak mencoba daripada mendengarkan."
        />

        <dl className="grid gap-y-10 border-y border-[var(--tone-rule)] py-10 sm:grid-cols-3 sm:py-12">
          {facts.map((fact) => (
            <div key={fact.key} data-motion="rise" className="flex flex-col items-center gap-3 px-6 text-center">
              <dt className="sr-only">{fact.label}</dt>
              <dd className="type-mega tabular-nums">
                {fact.num !== undefined ? (
                  <CountUp value={fact.num} suffix={fact.suffix} />
                ) : (
                  fact.text
                )}
              </dd>
              <dd className="type-small max-w-[22ch] text-[var(--tone-muted)]">{fact.label}</dd>
            </div>
          ))}
        </dl>

        <ol className="grid grid-cols-1 border border-[var(--tone-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(([strong, rest], index) => {
            const num = String(index + 1).padStart(2, "0");
            const cellBorder =
              index === 0
                ? "border-b border-[var(--tone-rule)] sm:border-r lg:border-b-0"
                : index === 1
                  ? "border-b border-[var(--tone-rule)] lg:border-b-0 lg:border-r"
                  : index === 2
                    ? "border-b border-[var(--tone-rule)] sm:border-b-0 sm:border-r"
                    : "";

            return (
              <li
                key={strong}
                data-motion="slide"
                className={`group flex flex-col justify-between p-6 transition-colors duration-300 hover:bg-[var(--tone-tile)]/60 sm:p-8 ${cellBorder}`}
              >
                <div className="mb-10 flex items-start justify-between gap-4">
                  <span className="text-5xl font-black leading-none tracking-tighter tabular-nums text-[var(--tone-ink)]/15 transition-colors duration-300 group-hover:text-[var(--tone-accent)]">
                    {num}
                  </span>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-[var(--tone-ink)] sm:text-base">
                    {strong}
                  </h3>
                  <p className="type-small leading-relaxed text-[var(--tone-muted)]">
                    {rest.charAt(0).toUpperCase() + rest.slice(1)}.
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
