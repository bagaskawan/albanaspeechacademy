import React from "react";
import Link from "next/link";
import { FilePlus2, Pencil } from "lucide-react";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { Card } from "@/components/ui/card";
import { PageAction } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
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
        <div role="alert" className="rounded-xl bg-admin-rose-soft p-3 text-xs font-semibold text-admin-rose-ink">
          Daftar artikel tidak dapat dimuat: {error.message}
        </div>
      )}

      {!error && !data?.length && (
        <div className="rounded-2xl border border-dashed border-border-default bg-bg-card p-10 text-center">
          <p className="text-xs text-text-muted">Belum ada artikel.</p>
        </div>
      )}

      {!!data?.length && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border-default bg-bg-card shadow-xs md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border-default bg-bg-well/50 font-semibold text-zinc-650 dark:text-zinc-400">
                    <th className="px-5 py-3.5">Judul</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Terbit</th>
                    <th className="px-5 py-3.5">Diperbarui</th>
                    <th className="px-5 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/40">
                  {data.map((article) => (
                    <tr key={article.slug} className="hover:bg-bg-well/40">
                      <td className="max-w-[360px] px-5 py-3.5">
                        <Link href={`/admin/artikel/${article.slug}`} className="font-bold text-text-primary hover:underline">
                          {article.title}
                        </Link>
                        <p className="mt-0.5 truncate text-[11px] text-text-secondary">{article.excerpt}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${article.published ? "bg-[#DCFCE7] text-[#166534] dark:bg-[#052E16] dark:text-[#86EFAC]" : "bg-bg-well text-text-secondary"}`}>
                          {article.published ? "Terbit" : "Draf"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{formatDate(article.published_at) ?? "—"}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{formatDate(article.updated_at) ?? "—"}</td>
                      <td className="px-5 py-3.5 text-center">
                        <Link
                          href={`/admin/artikel/${article.slug}`}
                          title="Ubah"
                          className="inline-flex rounded-full border border-admin-lilac-dot/30 bg-admin-lilac-soft p-1.5 text-admin-lilac-ink hover:bg-admin-lilac-soft"
                        >
                          <Pencil size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {data.map((article) => (
              <Card key={article.slug} className="flex flex-col gap-3 p-4">
                <div>
                  <Link href={`/admin/artikel/${article.slug}`} className="text-sm font-black text-text-primary hover:underline">
                    {article.title}
                  </Link>
                  <p className="mt-1 text-[11px] text-text-secondary">{article.excerpt}</p>
                </div>
                <dl className="space-y-1 text-[11px]">
                  <div className="flex gap-2">
                    <dt className="text-text-secondary">Status</dt>
                    <dd className="text-text-primary">{article.published ? "Terbit" : "Draf"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-text-secondary">Terbit</dt>
                    <dd className="text-text-primary">{formatDate(article.published_at) ?? "—"}</dd>
                  </div>
                </dl>
                <Link
                  href={`/admin/artikel/${article.slug}`}
                  className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-admin-lilac-dot/30 bg-admin-lilac-soft px-3 text-[11px] font-bold text-admin-lilac-ink"
                >
                  <Pencil size={12} /> Ubah
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
