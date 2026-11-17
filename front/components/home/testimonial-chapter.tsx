import { Container } from "@/components/layout/container";
import type { HomeTestimonial } from "@/lib/home-data";
import { SectionIntro } from "./section-intro";

export function TestimonialChapter({ testimonials }: { testimonials: HomeTestimonial[] }) {
  if (!testimonials.length) return null;

  return (
    <section id="hasil" className="section" aria-labelledby="hasil-title">
      <Container className="max-w-7xl">
        <SectionIntro
          eyebrow="[ CERITA PESERTA ]"
          title={
            <>
              Mereka pernah <em className="accent-serif">gugup juga</em>
            </>
          }
          titleId="hasil-title"
          description="Cerita singkat dari peserta yang sudah berlatih bersama Albana."
        />
        <ul className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          {testimonials.map((item, index) => (
            <li
              key={item.id}
              data-motion="rise"
              className={`rounded-card border border-rule p-6 ${
                index === 0 ? "bg-panel-soft md:p-9" : "bg-card"
              }`}
            >
              <blockquote className={index === 0 ? "font-display text-2xl leading-snug" : "leading-relaxed"}>
                “{item.quote}”
              </blockquote>
              <p className="mt-6 border-t border-rule pt-4 font-semibold">{item.attribution}</p>
              {item.roleLabel ? <p className="text-sm text-muted">{item.roleLabel}</p> : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
