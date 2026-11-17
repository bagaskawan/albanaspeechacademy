import Image from "next/image";
import { Container } from "@/components/layout/container";
import { academyRequest } from "@/lib/server/academy-api";

type Media = { id: number; alt_text: string | null };

export async function PracticePreviewSection() {
  let media: Media | null = null;
  try {
    const rows = await academyRequest("media_assets?select=id,alt_text&kind=eq.image&published=eq.true&consent_at=not.is.null&order=created_at.desc&limit=1");
    if (Array.isArray(rows)) media = rows[0] ?? null;
  } catch { /* The labelled dummy stays visible until a consented image is available. */ }
  const src = media ? `/api/media/${media.id}` : "/images/preview/simulasi-panggung.jpg";
  const caption = media?.alt_text || "Contoh visual — bukan dokumentasi kelas Albana.";
  return <section className="pb-12 md:pb-20" aria-label="Bukti proses"><Container className="max-w-7xl">
    <figure data-motion="media"><div className="relative aspect-[16/7] overflow-hidden bg-panel-soft max-sm:aspect-[4/3]"><Image src={src} alt={caption} fill sizes="(min-width: 1280px) 1280px, 100vw" className="object-cover" /></div><figcaption className="mt-2 text-sm text-muted">{caption}</figcaption></figure>
  </Container></section>;
}
