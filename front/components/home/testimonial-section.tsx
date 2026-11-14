import { Container } from "@/components/layout/container";
import { SectionIntro } from "./section-intro";
import { academyRequest } from "@/lib/server/academy-api";
import { TestimonialCarousel, type TestimonialPreview } from "./testimonial-carousel";

// Preview cards only. Published testimonials require recorded consent from the
// testimonials catalog; these slots are labelled so they are never mistaken for real quotes.
// shortcut: static preview cards, replace with published testimonials after consent.
const previewTestimonials = [
  {
    id: "01",
    quote: "Kutipan peserta Series akan tampil di sini setelah disetujui.",
    name: "Peserta Series",
    program: "Program Series",
    initials: "PS",
  },
  {
    id: "02",
    quote: "Kutipan peserta for Speakers akan tampil di sini setelah disetujui.",
    name: "Peserta for Speakers",
    program: "Program for Speakers",
    initials: "PF",
  },
  {
    id: "03",
    quote: "Kutipan peserta in-house akan tampil di sini setelah disetujui.",
    name: "Peserta in-house",
    program: "In-house training",
    initials: "PI",
  },
] satisfies readonly TestimonialPreview[];

export async function TestimonialSection() {
  let published: { id: number; attribution: string; quote: string }[] = [];
  try {
    const rows = await academyRequest("testimonials?select=id,attribution,quote&order=id");
    if (Array.isArray(rows)) published = rows;
  } catch { /* Keep the labelled preview when the catalog fails. */ }
  return (
    <section id="testimoni" className="section bg-panel-soft" aria-labelledby="testimoni-title">
      <Container className="max-w-5xl">
        <SectionIntro
          description={published.length ? "Pengalaman peserta yang telah memberi izin publikasi." : "Bagian ini disiapkan untuk pengalaman peserta yang telah memberi izin publikasi. Kartu berikut masih berupa pratinjau."}
          eyebrow="Cerita peserta"
          title="Setiap proses punya cerita yang pantas didengar"
          titleId="testimoni-title"
        />

        <TestimonialCarousel testimonials={published.length ? published.map((item) => ({ id: String(item.id), quote: item.quote, name: item.attribution, program: "", initials: item.attribution.slice(0, 2).toUpperCase() })) : previewTestimonials} />

      </Container>
    </section>
  );
}
