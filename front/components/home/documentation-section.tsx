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
    const rows = await academyRequest("gallery?select=id,image_url,title&order=id");
    if (Array.isArray(rows)) gallery = rows as DocumentationItem[];
  } catch { /* Section stays available when the catalog is offline. */ }

  return (
    <section id="dokumentasi" className="section" aria-labelledby="dokumentasi-title">
      <Container className="max-w-7xl">
        <SectionIntro
          description={gallery.length ? "Lihat suasana latihan, praktik, dan umpan balik dari kegiatan yang telah dipublikasikan." : "Media di bawah adalah contoh tata letak; dokumentasi kelas Albana akan menggantikannya setelah dipilih untuk tayang."}
          eyebrow="Gambaran kelas"
          title="Kenali ritme latihan lewat gambaran berikut"
          titleId="dokumentasi-title"
        />

        <DocumentationGallery items={gallery.length ? gallery : previewGallery} preview={!gallery.length} />
      </Container>
    </section>
  );
}
