import React from "react";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { DataTable, StatusChip } from "@/components/admin/ui/data-table";
import { TableToolbar } from "@/components/admin/ui/table-toolbar";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { RowActions } from "@/components/admin/ui/row-actions";
import { deleteArticleAction } from "@/lib/actions/article-actions";
import { ilikePattern } from "@/lib/ilike";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(date);
}

export default async function ArtikelPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const supabase = await requireAdminMember();
  const { q, status } = await searchParams;
  let request = supabase
    .from("articles")
    .select("slug,title,excerpt,published,published_at,updated_at")
    .order("updated_at", { ascending: false });
  if (q) request = request.ilike("title", ilikePattern(q));
  if (status === "terbit" || status === "draf") request = request.eq("published", status === "terbit");
  const { data, error } = await request;

  return (
    <div className="w-full space-y-5">
      <TableToolbar
        search={{ placeholder: "Cari judul artikel…" }}
        filters={[{ param: "status", label: "Status", options: [{ value: "draf", label: "Draf" }, { value: "terbit", label: "Terbit" }] }]}
        exportModule="artikel"
        exportDisabled={!data?.length}
        create={{ label: "Tulis artikel", href: "/admin/artikel/baru", icon: <FilePlus2 aria-hidden="true" size={18} strokeWidth={1.5} /> }}
      />

      {error && (
        <div role="alert" className="rounded-[20px] bg-admin-rose-soft p-4 text-[14px] text-admin-rose-ink">
          Daftar artikel tidak dapat dimuat: {error.message}
        </div>
      )}

      {!error && !data?.length && (
        q || status
          ? <EmptyState searching title="Tidak ada artikel yang cocok" description="Ubah kata kunci atau saringan." />
          : <EmptyState title="Belum ada artikel" description="Tulis artikel pertama; artikel tampil di situs setelah diterbitkan." />
      )}

      {!!data?.length && (
        <DataTable caption="Artikel" stackOnMobile>
          <thead>
            <tr>
              <th scope="col">Judul</th>
              <th scope="col">Status</th>
              <th scope="col">Terbit</th>
              <th scope="col">Diperbarui</th>
              <th scope="col" className="text-right"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            {data.map((article) => (
              <tr key={article.slug}>
                <td data-label="Judul" className="max-w-[420px]">
                  <Link href={`/admin/artikel/${article.slug}`} className="block truncate font-medium hover:underline" title={article.title}>
                    {article.title}
                  </Link>
                  <p className="truncate text-[13px] text-admin-text-secondary" title={article.excerpt ?? undefined}>{article.excerpt || "—"}</p>
                </td>
                <td data-label="Status"><StatusChip tone={article.published ? "mint" : "neutral"}>{article.published ? "Terbit" : "Draf"}</StatusChip></td>
                <td data-label="Terbit" className="whitespace-nowrap text-admin-text-secondary">{formatDate(article.published_at) ?? "—"}</td>
                <td data-label="Diperbarui" className="whitespace-nowrap text-admin-text-secondary">{formatDate(article.updated_at) ?? "—"}</td>
                <td className="text-right">
                  <RowActions itemName={article.title} editHref={`/admin/artikel/${article.slug}`} onDelete={deleteArticleAction.bind(null, article.slug)} />
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </div>
  );
}
