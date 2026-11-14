import ArticleEditor from "@/components/admin/article/ArticleEditor";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

export default async function ArtikelBaruPage() {
  await requireAdminMember();
  return <ArticleEditor article={null} />;
}
