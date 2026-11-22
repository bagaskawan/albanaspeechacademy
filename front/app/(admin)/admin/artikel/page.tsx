import React from "react";
import Link from "next/link";
import { ExternalLink, FilePlus2, FileText } from "lucide-react";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { DataTable, StatusChip, rowActionClass } from "@/components/admin/ui/data-table";
import { TableToolbar } from "@/components/admin/ui/table-toolbar";
import { RowActions } from "@/components/admin/ui/row-actions";
import { MobileArticleRowActions } from "@/components/admin/article/MobileArticleRowActions";
import { deleteArticleAction } from "@/lib/actions/article-actions";
import { ilikePattern } from "@/lib/ilike";

export const dynamic = "force-dynamic";

function formatFullDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatShortDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatRelativeTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const absSec = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
  if (absSec < 60) return rtf.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  return formatShortDate(value) ?? "—";
}

function statusHref(q: string | undefined, nextStatus: string | null) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (nextStatus) params.set("status", nextStatus);
  const qs = params.toString();
  return qs ? `/admin/artikel?${qs}` : "/admin/artikel";
}

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const supabase = await requireAdminMember();
  const { q, status } = await searchParams;
  const activeStatus = status === "terbit" || status === "draf" ? status : null;

  let listQuery = supabase
    .from("articles")
    .select("slug,title,excerpt,published,published_at,updated_at,thumbnail_image_id")
    .order("updated_at", { ascending: false });
  if (q) listQuery = listQuery.ilike("title", ilikePattern(q));
  if (activeStatus) listQuery = listQuery.eq("published", activeStatus === "terbit");

  let countQuery = supabase.from("articles").select("published");
  if (q) countQuery = countQuery.ilike("title", ilikePattern(q));

  const [{ data, error }, { data: countRows }] = await Promise.all([listQuery, countQuery]);

  const allCount = countRows?.length ?? 0;
  const draftCount = countRows?.filter((r) => !r.published).length ?? 0;
  const publishedCount = countRows?.filter((r) => r.published).length ?? 0;

  return (
    <div className="w-full space-y-5">
      <TableToolbar
        search={{ placeholder: "Cari judul…" }}
        exportModule="artikel"
        exportDisabled={!data?.length}
        create={{
          label: "Tulis artikel",
          href: "/admin/artikel/baru",
          icon: <FilePlus2 aria-hidden="true" size={18} strokeWidth={1.5} />,
        }}
      />

      {/* Status filter chips with counts (§C.1) */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Saring status artikel">
        {[
          { key: null, label: `Semua ${allCount}` },
          { key: "draf", label: `Draf ${draftCount}` },
          { key: "terbit", label: `Terbit ${publishedCount}` },
        ].map((chip) => {
          const isActive = activeStatus === chip.key;
          return (
            <Link
              key={chip.key ?? "all"}
              href={statusHref(q, chip.key)}
              className={`inline-flex min-h-[36px] items-center rounded-full px-3.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-admin-ink text-admin-on-ink"
                  : "bg-admin-surface text-admin-text-secondary hover:bg-admin-surface-muted hover:text-admin-ink"
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-admin-rose-soft p-4 text-sm text-admin-rose-ink">
          <span>Daftar artikel gagal dimuat.</span>
          <Link
            href={statusHref(q, activeStatus)}
            className="rounded-md border border-admin-rose-ink/30 bg-admin-canvas px-3 py-1.5 text-xs font-semibold text-admin-rose-ink"
          >
            Coba lagi
          </Link>
        </div>
      )}

      {!error && !data?.length && (
        <div className="rounded-2xl border border-admin-line bg-admin-canvas p-8 text-center">
          {q || activeStatus ? (
            <>
              <p className="text-sm font-medium text-admin-ink">
                {q ? `Tidak ada artikel yang cocok dengan “${q}”.` : "Tidak ada artikel pada status ini."}
              </p>
              <Link
                href="/admin/artikel"
                className="mt-4 inline-flex min-h-[40px] items-center rounded-md border border-admin-line px-4 text-sm font-medium text-admin-ink hover:bg-admin-surface"
              >
                Hapus filter
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-admin-ink">
                Belum ada artikel. Tulisan pertama Anda akan muncul di sini.
              </p>
              <Link
                href="/admin/artikel/baru"
                className="mt-4 inline-flex min-h-[40px] items-center rounded-md bg-admin-ink px-4 text-sm font-medium text-admin-on-ink"
              >
                Tulis artikel
              </Link>
            </>
          )}
        </div>
      )}

      {!!data?.length && (
        <>
          {/* Desktop table (§C.2) */}
          <div className="hidden md:block">
            <DataTable caption="Artikel">
              <thead>
                <tr>
                  <th scope="col">Artikel</th>
                  <th scope="col" className="w-[112px]">Status</th>
                  <th scope="col" className="w-[160px]">Diperbarui</th>
                  <th scope="col" className="w-[140px]">Terbit</th>
                  <th scope="col" className="w-[56px] text-right">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((article) => {
                  const thumbUrl = article.thumbnail_image_id
                    ? `/api/article-images/${article.thumbnail_image_id}`
                    : null;
                  const fullUpdated = formatFullDate(article.updated_at);
                  const editHref = `/admin/artikel/${article.slug}`;
                  return (
                    <tr key={article.slug} className="group relative transition-colors hover:bg-admin-surface">
                      <td>
                        <div className="flex items-center gap-3.5">
                          {thumbUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbUrl}
                              alt=""
                              width={64}
                              height={48}
                              className="h-12 w-16 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-admin-surface-muted text-admin-text-secondary"
                            >
                              <FileText className="h-5 w-5" strokeWidth={1.5} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <Link
                              href={editHref}
                              className="line-clamp-2 text-[15px] font-semibold text-admin-ink after:absolute after:inset-0 group-hover:underline focus-visible:outline-none"
                              title={article.title}
                            >
                              {article.title}
                            </Link>
                            <p
                              className="line-clamp-1 text-[13px] text-admin-text-secondary"
                              title={article.excerpt ?? undefined}
                            >
                              {article.excerpt || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusChip tone={article.published ? "mint" : "neutral"}>
                          {article.published ? "Terbit" : "Draf"}
                        </StatusChip>
                      </td>
                      <td className="whitespace-nowrap text-[13px] text-admin-text-secondary">
                        <time dateTime={article.updated_at} title={fullUpdated ?? undefined}>
                          {formatRelativeTime(article.updated_at)}
                        </time>
                      </td>
                      <td className="whitespace-nowrap text-[13px] text-admin-text-secondary">
                        {formatShortDate(article.published_at) ?? "—"}
                      </td>
                      <td className="relative z-10 text-right">
                        <RowActions
                          itemName={article.title}
                          editHref={editHref}
                          onDelete={deleteArticleAction.bind(null, article.slug)}
                          extra={
                            article.published ? (
                              <Link
                                href={`/artikel/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Lihat publik ${article.title}`}
                                title="Lihat publik"
                                className={rowActionClass}
                              >
                                <ExternalLink aria-hidden="true" size={18} strokeWidth={1.5} />
                              </Link>
                            ) : null
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          </div>

          {/* Mobile stacked rows (§C.3) */}
          <ul className="divide-y divide-admin-line border-y border-admin-line md:hidden">
            {data.map((article) => {
              const thumbUrl = article.thumbnail_image_id
                ? `/api/article-images/${article.thumbnail_image_id}`
                : null;
              const editHref = `/admin/artikel/${article.slug}`;
              return (
                <li key={article.slug} className="relative flex items-start justify-between gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={editHref}
                      className="line-clamp-2 text-[15px] font-semibold leading-snug text-admin-ink after:absolute after:inset-0"
                    >
                      {article.title}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-2 text-[13px] text-admin-text-secondary">
                      <span>{article.published ? "Terbit" : "Draf"}</span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={article.updated_at}>Diubah {formatRelativeTime(article.updated_at)}</time>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbUrl}
                        alt=""
                        width={56}
                        height={42}
                        className="h-[42px] w-[56px] rounded object-cover"
                      />
                    ) : null}
                    <MobileArticleRowActions
                      slug={article.slug}
                      title={article.title}
                      published={article.published}
                      onDelete={deleteArticleAction.bind(null, article.slug)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
