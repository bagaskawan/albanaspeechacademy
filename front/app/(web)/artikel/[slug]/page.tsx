import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article/article-body";
import {
  collectArticleImageIds,
  deriveExcerpt,
  normalizeArticleBlocks,
  readingMinutes,
} from "@/lib/article-blocks";
import {
  SITE_NAME,
  SITE_URL,
  buildArticleJsonLd,
  buildArticleSeoImage,
  deriveArticleSeoDescription,
  serializeJsonLd,
} from "@/lib/seo";
import {
  batchArticleImageDimensions,
  readPublicArticle,
} from "@/lib/server/public-articles";

export const dynamic = "force-dynamic";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function formatPublishedAt(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) return {};
  const article = await readPublicArticle(slug);
  if (!article) return {};

  const description = deriveArticleSeoDescription(article.excerpt, article.body);
  const canonical = `${SITE_URL}/artikel/${encodeURIComponent(article.slug)}`;
  const ogImage = buildArticleSeoImage(article.thumbnail_image_id);

  return {
    title: `${article.title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: article.title,
      description,
      url: canonical,
      type: "article",
      ...(article.published_at ? { publishedTime: article.published_at } : {}),
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) notFound();
  const article = await readPublicArticle(slug);
  if (!article) notFound();

  const normalized = normalizeArticleBlocks(article.body_blocks);
  const blocks = normalized.blocks ?? [];
  const imageIds = collectArticleImageIds(blocks);
  const dimensions = await batchArticleImageDimensions(imageIds);

  const published = formatPublishedAt(article.published_at);
  const mins = readingMinutes(article.body);
  const firstParagraph = blocks.length
    ? deriveExcerpt(blocks)
    : article.body.trim().split(/\n\s*\n/)[0]?.trim() ?? "";
  const cleanExcerpt = article.excerpt?.trim() ?? "";
  const showSubtitle = Boolean(cleanExcerpt && !firstParagraph.startsWith(cleanExcerpt));

  const jsonLd = buildArticleJsonLd({
    slug: article.slug,
    title: article.title,
    description: deriveArticleSeoDescription(article.excerpt, article.body),
    publishedAt: article.published_at,
    updatedAt: article.updated_at,
    thumbnailImageId: article.thumbnail_image_id,
  });

  return (
    <main className="site-wrapper pb-20 pt-8 md:pt-16" id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <article className="mx-auto w-full max-w-[var(--article-measure)]">
        <Link
          href="/artikel"
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#47607D] hover:text-[#10243F] hover:underline hover:underline-offset-4"
        >
          ← Semua artikel
        </Link>

        <header className="article-prose mt-4">
          <h1>{article.title}</h1>
          {showSubtitle ? <p className="article-subtitle">{cleanExcerpt}</p> : null}
          <div className="article-meta mt-4 flex flex-wrap items-center gap-x-2">
            {published ? (
              <>
                <time dateTime={article.published_at ?? undefined}>{published}</time>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            <span>{mins} menit baca</span>
          </div>
        </header>

        <hr className="my-8 border-[#D8E4F0]" />

        <ArticleBody body={article.body} blocks={article.body_blocks} dimensions={dimensions} />

        <hr className="mt-12 border-[#D8E4F0]" />

        <footer className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/artikel"
            className="inline-flex min-h-[44px] items-center justify-center text-sm font-medium text-[#47607D] hover:text-[#10243F] hover:underline hover:underline-offset-4 sm:justify-start"
          >
            ← Semua artikel
          </Link>
          <Link
            href="/#program"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded bg-[#26599A] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1E477B] sm:w-auto"
          >
            Lihat program
          </Link>
        </footer>
      </article>
    </main>
  );
}
