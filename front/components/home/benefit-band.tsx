import { Container } from "@/components/layout/container";

const benefits = [
  <><strong>Lebih percaya diri</strong> saat semua mata tertuju padamu</>,
  <><strong>Presentasi lebih meyakinkan</strong> dari kalimat pertama</>,
  <><strong>Komunikasi kerja lebih efektif</strong> di rapat dan diskusi</>,
  <><strong>Tampil profesional</strong> saat mewakili tim atau organisasi</>,
];

export function BenefitBand() {
  return <section aria-label="Manfaat training" className="border-y border-rule py-6 md:py-8">
    <Container className="max-w-7xl">
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {benefits.map((benefit, index) => <li key={index} data-motion="slide" className="flex gap-4 border-rule lg:border-r lg:px-5 first:lg:pl-0 last:lg:border-0">
          <span className="font-display text-sm tabular-nums text-accent">{String(index + 1).padStart(2, "0")}</span>
          <span className="leading-snug text-ink">{benefit}</span>
        </li>)}
      </ol>
    </Container>
  </section>;
}
