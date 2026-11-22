import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { listPublishedArticleSlugs } from "@/lib/server/public-articles";

export const dynamic = "force-dynamic";

const PROGRAM_SLUGS = [
  "public-speaking-series",
  "public-speaking-for-speakers",
  "sertifikasi-pembicara-profesional",
  "inhouse-training",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listPublishedArticleSlugs();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/artikel`, changeFrequency: "daily", priority: 0.8 },
    ...PROGRAM_SLUGS.map((slug) => ({
      url: `${SITE_URL}/program/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/artikel/${encodeURIComponent(article.slug)}`,
    ...(article.updated_at ? { lastModified: new Date(article.updated_at) } : {}),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...articleEntries];
}
