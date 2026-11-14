import Link from "next/link";
import { listPublicArticles } from "@/lib/server/public-articles";

export const metadata = { title: "Artikel | Albana Speech Academy" };
export const instant = false;

function formatPublishedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

export default async function ArticlesPage() {
  let articles;
  try { articles = await listPublicArticles(); }
  catch { return <main className="site-wrapper py-16"><h1 className="font-display text-3xl font-semibold">Artikel belum dapat dimuat</h1><p className="mt-4">Coba lagi beberapa saat.</p></main>; }
  return <main className="site-wrapper py-16" id="main-content">
    <h1 className="font-display text-4xl font-semibold">Artikel</h1>
    {articles.length ? <ul className="mt-8 grid gap-5 md:grid-cols-2">{articles.map((article) => {
      const published = article.published_at ? formatPublishedAt(article.published_at) : null;
      return <li className="border border-rule p-6" key={article.slug}>
        <h2 className="font-display text-2xl font-semibold"><Link className="underline-offset-4 hover:underline" href={`/artikel/${article.slug}`}>{article.title}</Link></h2>
        {published && <time className="mt-2 block text-sm text-muted" dateTime={article.published_at ?? undefined}>{published}</time>}
        <p className="mt-3 text-muted">{article.excerpt}</p>
        <Link className="mt-5 inline-flex min-h-11 items-center font-semibold underline" href={`/artikel/${article.slug}`}>Baca artikel</Link>
      </li>;
    })}</ul> : <p className="mt-8 text-muted">Belum ada artikel yang diterbitkan.</p>}
  </main>;
}
