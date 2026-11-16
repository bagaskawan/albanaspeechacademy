import React from "react";
import Link from "next/link";
import { FilePlus2, Pencil } from "lucide-react";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { PageAction } from "@/components/admin/PageHeader";
import { DataTable, StatusChip, rowActionClass } from "@/components/admin/ui/data-table";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(date);
}

export default async function ArtikelPage() {
  const supabase = await requireAdminMember();
  const { data, error } = await supabase
    .from("articles")
    .select("slug,title,excerpt,published,published_at,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="w-full space-y-5">
      <PageAction href="/admin/artikel/baru" icon={<FilePlus2 aria-hidden="true" size={18} strokeWidth={1.5} />}>Tulis artikel</PageAction>

      {error && (
        <div role="alert" className="rounded-[20px] bg-admin-rose-soft p-4 text-[14px] text-admin-rose-ink">
          Daftar artikel tidak dapat dimuat: {error.message}
        </div>
      )}

      {!error && !data?.length && (
        <p className="rounded-[var(--admin-radius-card)] bg-admin-surface p-8 text-center text-[15px] text-admin-text-secondary">Belum ada artikel.</p>
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
                  <Link href={`/admin/artikel/${article.slug}`} aria-label={`Ubah ${article.title}`} title="Ubah" className={rowActionClass}>
                    <Pencil aria-hidden="true" size={18} strokeWidth={1.5} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </div>
  );
}
