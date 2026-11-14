import "server-only";
import { academyRequest } from "./academy-api";

export type PublicArticle = {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string | null;
};

export type PublicArticleDetail = PublicArticle & { body: string; body_blocks: unknown };

const LIST_COLUMNS = "slug,title,excerpt,published_at";

export async function listPublicArticles(): Promise<PublicArticle[]> {
  const rows = await academyRequest(`articles?select=${LIST_COLUMNS}&published=eq.true&order=published_at.desc.nullslast`);
  if (!Array.isArray(rows)) throw new Error("Daftar artikel tidak valid.");
  return rows as PublicArticle[];
}

export async function readPublicArticle(slug: string): Promise<PublicArticleDetail | null> {
  const rows = await academyRequest(
    `articles?select=${LIST_COLUMNS},body,body_blocks&published=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  if (!Array.isArray(rows)) throw new Error("Artikel tidak valid.");
  return (rows[0] as PublicArticleDetail | undefined) ?? null;
}
