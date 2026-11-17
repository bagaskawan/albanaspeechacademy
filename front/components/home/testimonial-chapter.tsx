import { Container } from "@/components/layout/container";
import type { HomeTestimonial } from "@/lib/home-data";
import { SectionIntro } from "./section-intro";

export function TestimonialChapter({ testimonials }: { testimonials: HomeTestimonial[] }) {
  if (!testimonials.length) return null;

  return (
    <section id="hasil" className="section tone-mist" aria-labelledby="hasil-title">
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
        <ul className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-[2fr_1fr_1fr]">
          {testimonials.map((item, index) => (
            <li
              key={item.id}
              data-motion="rise"
              className={index === 0 ? "" : "border-t border-[var(--tone-rule)] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"}
            >
              <blockquote className={index === 0 ? "type-display" : "leading-relaxed"}>
                <span className="font-[family-name:var(--font-serif)]" aria-hidden="true">“</span>{item.quote}<span className="font-[family-name:var(--font-serif)]" aria-hidden="true">”</span>
              </blockquote>
              <p className="mt-6 border-t border-[var(--tone-rule)] pt-4 font-semibold">{item.attribution}</p>
              {item.roleLabel ? <p className="text-sm text-[var(--tone-muted)]">{item.roleLabel}</p> : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
