import { Container } from "@/components/layout/container";
import { academyRequest } from "@/lib/server/academy-api";
import { SectionIntro } from "./section-intro";

type Testimonial = { id: number; attribution: string; quote: string; role_label: string | null };

export async function TestimonialChapter() {
  let testimonials: Testimonial[] = [];
  try {
    const rows = await academyRequest("testimonials?select=id,attribution,quote,role_label&published=eq.true&consent_at=not.is.null&order=id.desc&limit=3");
    if (Array.isArray(rows)) testimonials = rows as Testimonial[];
  } catch { /* Without consented records, this section stays hidden. */ }
  if (!testimonials.length) return null;
  return <section id="hasil" className="section" aria-labelledby="hasil-title"><Container className="max-w-7xl">
    <SectionIntro eyebrow="[ CERITA PESERTA ]" title={<>Mereka pernah <mark className="bg-highlight text-ink">gugup juga</mark></>} titleId="hasil-title" description="Cerita singkat dari peserta yang sudah berlatih bersama Albana." />
    <ul className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">{testimonials.map((item, index) => <li key={item.id} data-motion="rise" className={`rounded-card border border-rule p-6 ${index === 0 ? "bg-panel-soft md:p-9" : "bg-card"}`}>
      <blockquote className={index === 0 ? "font-display text-2xl leading-snug" : "leading-relaxed"}>“{item.quote}”</blockquote>
      <p className="mt-6 border-t border-rule pt-4 font-semibold">{item.attribution}</p>
      {item.role_label ? <p className="text-sm text-muted">{item.role_label}</p> : null}
    </li>)}</ul>
  </Container></section>;
}
