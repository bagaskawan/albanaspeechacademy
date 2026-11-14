import React from "react";
import Link from "next/link";
import { FilePlus2, Pencil } from "lucide-react";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";

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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-black uppercase tracking-wider text-text-primary">Artikel</h1>
          <p className="mt-0.5 max-w-2xl text-xs text-text-secondary">
            Draf dan artikel yang sudah terbit. Hanya artikel terbit yang tampil di situs publik.
          </p>
        </div>
        <Button asChild className="h-10 shrink-0 rounded-full bg-[#2F5C86] px-5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#24486A]">
          <Link href="/admin/artikel/baru">
            <FilePlus2 size={14} /> Tulis artikel
          </Link>
        </Button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-[#FEE2E2] p-3 text-xs font-semibold text-[#991B1B] dark:bg-[#450A0A] dark:text-[#FECACA]">
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
                          className="inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 p-1.5 text-sky-600 hover:bg-sky-500/20 dark:text-sky-400"
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
                  className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 text-[11px] font-bold text-sky-600 dark:text-sky-400"
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
