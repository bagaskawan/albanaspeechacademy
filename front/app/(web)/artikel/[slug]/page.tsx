import Link from "next/link";
import { notFound } from "next/navigation";
import { readPublicArticle } from "@/lib/server/public-articles";
import { ArticleBody } from "@/components/article/article-body";

export const instant = false;

function formatPublishedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const article = await readPublicArticle(slug);
  if (!article) notFound();
  const published = article.published_at ? formatPublishedAt(article.published_at) : null;

  return <main className="site-wrapper py-16" id="main-content">
    <Link className="inline-flex min-h-11 items-center underline" href="/artikel">← Semua artikel</Link>
    <article className="mx-auto mt-8 max-w-[68ch]">
      <h1 className="font-display text-4xl font-semibold">{article.title}</h1>
      {article.excerpt && <p className="mt-5 text-lg text-muted">{article.excerpt}</p>}
      {published && <time className="mt-3 block text-sm text-muted" dateTime={article.published_at ?? undefined}>{published}</time>}
      <ArticleBody body={article.body} blocks={article.body_blocks} />
    </article>
  </main>;
}
