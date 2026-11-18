import "server-only";
import { academyRequest } from "./academy-api";
import type { ProgramMediaItem } from "@/lib/program-media";
import { youtubeVideoId } from "@/lib/youtube";

export type ProgramGallery = {
  images: ProgramMediaItem[];
  videos: ProgramMediaItem[];
};

type RawAsset = {
  id: number;
  provider?: string;
  kind?: string;
  object_key?: string | null;
  alt_text?: string | null;
  program_slug?: string | null;
};

/** Media terbit per slug program, satu pembacaan untuk semua program. */
export async function readProgramGalleries(): Promise<Record<string, ProgramGallery>> {
  try {
    const rows = await academyRequest(
      "media_assets?select=id,provider,kind,object_key,alt_text,program_slug&published=eq.true&consent_at=not.is.null&order=created_at.desc"
    );
    if (!Array.isArray(rows)) return {};
    const galleries: Record<string, ProgramGallery> = {};

    for (const row of rows as RawAsset[]) {
      const slug = typeof row.program_slug === "string" ? row.program_slug.trim() : "";
      if (!slug || typeof row.id !== "number") continue;

      let item: ProgramMediaItem | null = null;
      if (row.provider === "youtube") {
        const videoId = youtubeVideoId(String(row.object_key ?? ""));
        if (videoId) {
          item = {
            id: row.id,
            kind: "video",
            provider: "youtube",
            src: `https://www.youtube-nocookie.com/embed/${videoId}`,
            alt: row.alt_text || "Video program",
            youtubeId: videoId,
          };
        }
      } else if (row.provider === "supabase_storage") {
        item = {
          id: row.id,
          kind: row.kind === "video" ? "video" : "image",
          provider: "supabase_storage",
          src: `/api/media/${row.id}`,
          alt: row.alt_text || slug,
          youtubeId: null,
        };
      }

      if (!item) continue;
      if (!galleries[slug]) galleries[slug] = { images: [], videos: [] };
      if (item.kind === "image") galleries[slug].images.push(item);
      else galleries[slug].videos.push(item);
    }

    return galleries;
  } catch {
    return {};
  }
}
