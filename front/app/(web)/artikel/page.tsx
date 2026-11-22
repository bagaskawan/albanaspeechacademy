import type { Metadata } from "next";
import Link from "next/link";
import { readingMinutes } from "@/lib/article-blocks";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { listPublicArticles, type PublicArticle } from "@/lib/server/public-articles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Artikel | ${SITE_NAME}`,
  description:
    "Catatan praktik berbicara di depan umum, teknik presentasi, dan komunikasi profesional dari trainer Albana Speech Academy.",
  alternates: {
    canonical: `${SITE_URL}/artikel`,
  },
  openGraph: {
    title: `Artikel | ${SITE_NAME}`,
    description:
      "Catatan praktik berbicara di depan umum, teknik presentasi, dan komunikasi profesional dari trainer Albana Speech Academy.",
    url: `${SITE_URL}/artikel`,
    type: "website",
  },
};

function formatPublishedLong(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

function formatPublishedMedium(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

export default async function ArticlesPage() {
  let articles: PublicArticle[] = [];
  let loadFailed = false;
  try {
    articles = await listPublicArticles();
  } catch {
    loadFailed = true;
    articles = [];
  }

  return (
    <main className="site-wrapper pb-20 pt-10 md:pt-16" id="main-content">
      <div className="mx-auto w-full max-w-[720px]">
        <header>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#47607D]">
            [ ARTIKEL ]
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.02em] text-[#10243F] md:text-4xl">
            Artikel
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#47607D] md:text-lg">
            Catatan praktik komunikasi, teknik presentasi, dan persiapan tampil di depan umum.
          </p>
        </header>

        {loadFailed ? (
          <div className="mt-10 border-t border-[#D8E4F0] pt-8">
            <p className="text-base text-[#10243F]">Artikel belum dapat dimuat. Coba lagi beberapa saat.</p>
            <Link
              href="/artikel"
              className="mt-4 inline-flex min-h-[44px] items-center rounded border border-[#D8E4F0] px-4 text-sm font-medium text-[#10243F] hover:bg-[#F3F7FC]"
            >
              Muat ulang
            </Link>
          </div>
        ) : articles.length === 0 ? (
          <div className="mt-10 border-t border-[#D8E4F0] pt-8">
            <p className="text-base text-[#47607D]">Belum ada artikel yang diterbitkan.</p>
            <Link
              href="/"
              className="mt-3 inline-flex min-h-[44px] items-center text-sm font-medium text-[#26599A] underline underline-offset-4"
            >
              Kembali ke beranda
            </Link>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-[#D8E4F0] border-t border-[#D8E4F0]">
            {articles.map((article, index) => {
              const dateLong = formatPublishedLong(article.published_at);
              const dateMedium = formatPublishedMedium(article.published_at);
              const mins = readingMinutes(article.body);
              const thumbUrl = article.thumbnail_image_id
                ? `/api/article-images/${article.thumbnail_image_id}`
                : null;

              return (
                <li key={article.slug}>
                  <article className="group relative py-6">
                    <div className="flex items-start justify-between gap-5 md:gap-8">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-1.5 text-sm font-medium tabular-nums text-[#47607D]">
                          {dateLong ? (
                            <>
                              <time dateTime={article.published_at ?? undefined}>
                                <span className="min-[480px]:hidden">{dateMedium}</span>
                                <span className="hidden min-[480px]:inline">{dateLong}</span>
                              </time>
                              <span aria-hidden="true">·</span>
                            </>
                          ) : null}
                          <span>{mins} menit baca</span>
                        </div>

                        <h2 className="mt-1.5 font-display text-xl font-bold leading-[1.25] text-[#10243F] md:text-2xl">
                          <Link
                            href={`/artikel/${article.slug}`}
                            className="line-clamp-3 after:absolute after:inset-0 group-hover:text-[#26599A] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-offset-4 after:focus-visible:outline-[#26599A] md:line-clamp-2"
                          >
                            {article.title}
                          </Link>
                        </h2>

                        {article.excerpt ? (
                          <p className="mt-2 hidden text-base leading-[1.55] text-[#47607D] min-[480px]:line-clamp-2">
                            {article.excerpt}
                          </p>
                        ) : null}
                      </div>

                      {thumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbUrl}
                          alt=""
                          width={160}
                          height={120}
                          loading={index < 3 ? "eager" : "lazy"}
                          decoding="async"
                          className="h-[72px] w-[96px] shrink-0 rounded bg-[#F3F7FC] object-cover md:h-[120px] md:w-[160px]"
                        />
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
