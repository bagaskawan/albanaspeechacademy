import "server-only";
import { academyRequest } from "./academy-api";
import { academyBillingClient } from "./academy-billing";
import { programBucket, type ProgramMediaItem } from "@/lib/program-media";
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

async function resolveSignedUrls(rows: RawAsset[]): Promise<Map<number, string>> {
  const resolved = new Map<number, string>();
  const byBucket = new Map<string, Array<{ id: number; key: string }>>();

  for (const row of rows) {
    if (row.provider !== "supabase_storage" || typeof row.id !== "number") continue;
    const key = typeof row.object_key === "string" ? row.object_key.trim() : "";
    if (!key) continue;
    const bucket = programBucket(row.program_slug);
    const list = byBucket.get(bucket) ?? [];
    list.push({ id: row.id, key });
    byBucket.set(bucket, list);
  }

  if (byBucket.size === 0) return resolved;

  try {
    const storage = academyBillingClient().storage;
    await Promise.all(
      Array.from(byBucket.entries()).map(async ([bucket, entries]) => {
        const { data, error } = await storage
          .from(bucket)
          .createSignedUrls(entries.map((entry) => entry.key), 3600);
        if (error || !Array.isArray(data)) return;
        for (let i = 0; i < entries.length; i += 1) {
          const signedUrl = data[i]?.signedUrl;
          if (typeof signedUrl === "string" && signedUrl) {
            resolved.set(entries[i].id, signedUrl);
          }
        }
      }),
    );
  } catch {
    // Fallback ke /api/media/{id} jika signing gagal atau kunci service belum ada.
  }

  return resolved;
}

/** Media terbit per slug program, satu pembacaan untuk semua program. */
export async function readProgramGalleries(): Promise<Record<string, ProgramGallery>> {
  try {
    const rows = await academyRequest(
      "media_assets?select=id,provider,kind,object_key,alt_text,program_slug&published=eq.true&consent_at=not.is.null&order=created_at.desc"
    );
    if (!Array.isArray(rows)) return {};
    const typedRows = rows as RawAsset[];
    const signedUrls = await resolveSignedUrls(typedRows);
    const galleries: Record<string, ProgramGallery> = {};

    for (const row of typedRows) {
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
          src: signedUrls.get(row.id) ?? `/api/media/${row.id}`,
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
