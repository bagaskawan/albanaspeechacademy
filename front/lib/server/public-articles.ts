import "server-only";
import { cache } from "react";
import { academyRequest } from "./academy-api";
import { academyBillingClient } from "./academy-billing";

export type PublicArticle = {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string | null;
  body: string;
  thumbnail_image_id: string | null;
};

export type PublicArticleDetail = PublicArticle & {
  body_blocks: unknown;
  updated_at: string | null;
};

export type ArticleImageDimensions = {
  width: number;
  height: number;
};

const LIST_COLUMNS = "slug,title,excerpt,published_at,body,thumbnail_image_id";

export async function listPublicArticles(): Promise<PublicArticle[]> {
  const rows = await academyRequest(
    `articles?select=${LIST_COLUMNS}&published=eq.true&order=published_at.desc.nullslast`,
  );
  if (!Array.isArray(rows)) throw new Error("Daftar artikel tidak valid.");
  return rows as PublicArticle[];
}

export const readPublicArticle = cache(async (slug: string): Promise<PublicArticleDetail | null> => {
  const rows = await academyRequest(
    `articles?select=${LIST_COLUMNS},body_blocks,updated_at&published=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  if (!Array.isArray(rows)) throw new Error("Artikel tidak valid.");
  return (rows[0] as PublicArticleDetail | undefined) ?? null;
});

export async function batchArticleImageDimensions(
  ids: string[],
): Promise<Record<string, ArticleImageDimensions>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};

  const { data, error } = await academyBillingClient()
    .from("article_images")
    .select("id,width,height")
    .in("id", unique)
    .not("ready_at", "is", null)
    .is("detached_at", null)
    .is("cleanup_claimed_at", null);

  if (error || !data) return {};

  const map: Record<string, ArticleImageDimensions> = {};
  for (const row of data) {
    if (typeof row.id === "string" && typeof row.width === "number" && typeof row.height === "number") {
      map[row.id.toLowerCase()] = { width: row.width, height: row.height };
    }
  }
  return map;
}

export async function listPublishedArticleSlugs(): Promise<{ slug: string; updated_at: string | null }[]> {
  const rows = await academyRequest(
    "articles?select=slug,updated_at&published=eq.true&order=published_at.desc.nullslast",
  );
  if (!Array.isArray(rows)) throw new Error("Daftar slug artikel tidak valid.");
  return rows as { slug: string; updated_at: string | null }[];
}
