import { notFound } from "next/navigation";
import ArticleEditor from "@/components/admin/article/ArticleEditor";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { legacyBodyToBlocks, normalizeArticleBlocks } from "@/lib/article-blocks";

export const dynamic = "force-dynamic";

export default async function ArtikelEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await requireAdminMember();
  const { data, error } = await supabase
    .from("articles")
    .select("slug,title,body,body_blocks,published,published_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return (
      <div role="alert" className="rounded-xl bg-[#FEE2E2] p-3 text-xs font-semibold text-[#991B1B] dark:bg-[#450A0A] dark:text-[#FECACA]">
        Artikel tidak dapat dimuat: {error.message}
      </div>
    );
  }
  if (!data) notFound();

  const stored = normalizeArticleBlocks(data.body_blocks);
  const blocks = stored.blocks ?? legacyBodyToBlocks(data.body);

  return (
    <ArticleEditor
      article={{
        slug: data.slug,
        title: data.title,
        published: data.published,
        publishedAt: data.published_at,
        updatedAt: data.updated_at,
        blocks,
      }}
    />
  );
}
