import { Container } from "@/components/layout/container";
import { academyRequest } from "@/lib/server/academy-api";
import { DocumentationGallery, type DocumentationItem } from "./documentation-gallery";
import { SectionIntro } from "./section-intro";

export async function DocumentationSection() {
  let gallery: DocumentationItem[] = [];
  try {
    const rows = await academyRequest("gallery?select=id,image_url,title&order=id");
    if (Array.isArray(rows)) gallery = rows as DocumentationItem[];
  } catch { /* Section stays available when the catalog is offline. */ }

  return (
    <section id="dokumentasi" className="section" aria-labelledby="dokumentasi-title">
      <Container className="max-w-5xl">
        <SectionIntro
          description=""
          eyebrow="Gambaran kelas"
          title="Kenali ritme latihan lewat gambaran berikut"
          titleId="dokumentasi-title"
        />

        {gallery.length ? (
          <DocumentationGallery items={gallery} />
        ) : (
          <p className="mt-8 leading-[1.6] text-muted">Belum ada dokumentasi yang dipublikasikan.</p>
        )}
      </Container>
    </section>
  );
}
