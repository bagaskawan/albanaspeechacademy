import { Container } from "@/components/layout/container";
import type { HomeData } from "@/lib/home-data";

const benefits = [
  <><strong>Lebih percaya diri</strong> saat semua mata tertuju padamu</>,
  <><strong>Presentasi lebih meyakinkan</strong> dari kalimat pertama</>,
  <><strong>Komunikasi kerja lebih efektif</strong> di rapat dan diskusi</>,
  <><strong>Tampil profesional</strong> saat mewakili tim atau organisasi</>,
];

export function BenefitBand({ hero }: { hero: HomeData["hero"] }) {
  return (
    <>
      <section aria-label="Fakta program" className="tone-canvas">
        <Container className="max-w-7xl">
          <dl className="grid divide-y divide-[var(--tone-rule)] border-b border-[var(--tone-rule)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="py-6 sm:px-6 sm:first:pl-0">
              <dt className="eyebrow">Public Training</dt>
              <dd className="type-title mt-2 tabular-nums">{hero.openPrograms} program dibuka</dd>
            </div>

            {hero.nextBatch ? (
              <>
                <div className="py-6 sm:px-6">
                  <dt className="eyebrow">Batch terdekat · {hero.nextBatch.statusLabel}</dt>
                  <dd className="type-title mt-2">
                    {hero.nextBatch.programTitle} · {hero.nextBatch.batchName}
                  </dd>
                </div>
                <div className="py-6 sm:px-6 sm:last:pr-0">
                  <dt className="eyebrow">Sesi pertama · {hero.nextBatch.formatLabel}</dt>
                  <dd className="type-title mt-2 tabular-nums">{hero.nextBatch.firstDateLabel}</dd>
                </div>
              </>
            ) : (
              <div className="py-6 sm:col-span-2 sm:px-6">
                <dt className="eyebrow">Batch terdekat</dt>
                <dd className="mt-2 text-[var(--tone-muted)]">
                  Jadwal kelas berikutnya belum tersedia.
                </dd>
              </div>
            )}
          </dl>
        </Container>
      </section>

      <section aria-label="Manfaat training" className="tone-canvas py-6 md:py-8">
        <Container className="max-w-7xl">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const isContrast = index === 3;
              return (
                <li
                  key={index}
                  data-motion="slide"
                  className={`flex flex-col justify-between gap-6 p-6 transition-colors ${
                    isContrast
                      ? "bg-[var(--color-accent-strong)] text-white"
                      : "bg-[var(--tone-tile)] text-[var(--tone-ink)]"
                  }`}
                >
                  <span
                    className={`font-display text-xs font-bold tabular-nums ${
                      isContrast ? "text-white/80" : "text-[var(--tone-accent)]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed md:text-base">{benefit}</span>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>
    </>
  );
}
