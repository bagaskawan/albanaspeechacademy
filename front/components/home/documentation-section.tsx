import { Container } from "@/components/layout/container";
import { academyRequest } from "@/lib/server/academy-api";
import { DocumentationGallery, type DocumentationItem } from "./documentation-gallery";
import { SectionIntro } from "./section-intro";

const previewGallery: DocumentationItem[] = [
  { id: -1, image_url: "/images/preview/suasana-kelas.jpg", title: "Contoh visual suasana kelas" },
  { id: -2, image_url: "/images/preview/latihan-mc.jpg", title: "Contoh visual latihan MC" },
];

export async function DocumentationSection() {
  let gallery: DocumentationItem[] = [];
  try {
    const rows = await academyRequest("gallery?select=id,image_url,title&consent_verified_at=not.is.null&order=id.desc");
    if (Array.isArray(rows)) gallery = rows as DocumentationItem[];
  } catch { /* Section stays available when the catalog is offline. */ }

  return (
    <section id="dokumentasi" className="section" aria-labelledby="dokumentasi-title">
      <Container className="max-w-7xl">
        <SectionIntro
          description={gallery.length ? "Praktik, umpan balik, dan momen di atas panggung dari kegiatan Albana." : "Contoh visual — bukan dokumentasi kelas Albana."}
          eyebrow="[ DOKUMENTASI ]"
          title={<>Seperti inilah <mark className="bg-highlight text-ink">suasana latihannya</mark></>}
          titleId="dokumentasi-title"
        />

        <DocumentationGallery items={gallery.length ? gallery : previewGallery} preview={!gallery.length} />
      </Container>
    </section>
  );
}
