import type { HomeTestimonial } from "@/lib/home-data";
import { SectionIntro } from "./section-intro";
import { TestimonialSlider } from "./testimonial-slider";
import { Accent } from "./ui/accent";

export function TestimonialChapter({ testimonials }: { testimonials: HomeTestimonial[] }) {
  if (!testimonials.length) return null;

  return (
    <section id="hasil" className="tone-mist home-section" aria-labelledby="hasil-title">
      <div className="home-container home-stack-head">
        <SectionIntro
          eyebrow="06 · Cerita peserta"
          titleId="hasil-title"
          title={
            <>
              Mereka pernah <Accent>gugup juga.</Accent>
            </>
          }
          description="Cerita singkat dari peserta yang sudah berlatih bersama Albana, sebelum dan sesudah berdiri di depan orang."
        />
        <TestimonialSlider testimonials={testimonials} />
      </div>
    </section>
  );
}
