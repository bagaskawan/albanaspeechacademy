"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DataTable, StatusChip } from "@/components/admin/ui/data-table";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { TableToolbar, matchesQuery, type ToolbarFilter } from "@/components/admin/ui/table-toolbar";
import type { AdminActivityAction, AdminActivityLogRow } from "@/lib/server/admin-activity";

const PAGE_SIZE = 20;

const ACTION_META: Record<
  AdminActivityAction,
  { label: string; tone: "mint" | "peach" | "rose" | "lilac" | "neutral" }
> = {
  create: { label: "Tambah", tone: "mint" },
  update: { label: "Ubah", tone: "lilac" },
  delete: { label: "Hapus", tone: "rose" },
  verify: { label: "Verifikasi", tone: "mint" },
  reject: { label: "Tolak", tone: "rose" },
  status: { label: "Status", tone: "peach" },
  password: { label: "Password", tone: "neutral" },
};

const MODULE_LABELS: Record<string, string> = {
  program: "Program & Batch",
  pendaftar: "Pendaftar",
  tagihan: "Tagihan",
  "inhouse-galeri": "Galeri In House",
  partner: "Our Partner",
  artikel: "Artikel",
  galeri: "Galeri",
  testimoni: "Testimoni",
  trainer: "Trainer",
  "profil-akademi": "Profil Akademi",
  kontak: "Kontak",
  rekening: "Rekening",
  pengaturan: "Pengaturan",
  akun: "Akun",
};

const ROLE_LABELS: Record<string, string> = {
  adminsuper: "Super Admin",
  admin: "Admin",
};

const wibDateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

function formatWib(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${wibDateFormat.format(date)} WIB`;
}

function moduleLabel(moduleSlug: string): string {
  return MODULE_LABELS[moduleSlug] ?? moduleSlug;
}

function actionInfo(action: string) {
  if (action in ACTION_META) {
    return ACTION_META[action as AdminActivityAction];
  }
  return { label: action, tone: "neutral" as const };
}

export function UserActivityClient({ logs }: { logs: AdminActivityLogRow[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [refreshing, startRefresh] = useTransition();

  const query = params.get("q") ?? "";
  const moduleFilter = params.get("module") ?? "";
  const actionFilter = params.get("action") ?? "";
  const filterKey = `${query}|${moduleFilter}|${actionFilter}`;
  const [pagination, setPagination] = useState<{ key: string; page: number }>({
    key: filterKey,
    page: 1,
  });

  const filters: ToolbarFilter[] = useMemo(() => {
    const presentModules = new Set(logs.map((row) => row.module));
    const moduleOrder = Object.keys(MODULE_LABELS);
    const allModules = [
      ...moduleOrder,
      ...Array.from(presentModules).filter((mod) => !moduleOrder.includes(mod)).sort(),
    ];

    return [
      {
        param: "module",
        label: "Modul",
        options: allModules.map((mod) => ({ value: mod, label: moduleLabel(mod) })),
      },
      {
        param: "action",
        label: "Aksi",
        options: (Object.keys(ACTION_META) as AdminActivityAction[]).map((act) => ({
          value: act,
          label: ACTION_META[act].label,
        })),
      },
    ];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((row) => {
      if (moduleFilter && row.module !== moduleFilter) return false;
      if (actionFilter && row.action !== actionFilter) return false;
      if (!query.trim()) return true;
      const searchable = [
        row.actor_username,
        ROLE_LABELS[row.actor_role] ?? row.actor_role,
        moduleLabel(row.module),
        row.module,
        actionInfo(row.action).label,
        row.entity_label ?? "",
        row.summary,
      ].join(" ");
      return matchesQuery(searchable, query);
    });
  }, [logs, moduleFilter, actionFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rawPage = pagination.key === filterKey ? pagination.page : 1;
  const currentPage = Math.min(Math.max(1, rawPage), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const searching = Boolean(query.trim() || moduleFilter || actionFilter);

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    setPagination({ key: filterKey, page: clamped });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <TableToolbar
        search={{ placeholder: "Cari aktivitas, pengguna, atau modul…" }}
        filters={filters}
        refreshing={refreshing}
        onRefresh={() => {
          startRefresh(() => {
            router.refresh();
          });
        }}
      />

      {filtered.length === 0 ? (
        searching ? (
          <EmptyState
            searching
            title="Tidak ada aktivitas yang cocok"
            description="Ubah kata kunci pencarian atau saringan modul dan aksi."
          />
        ) : (
          <EmptyState
            title="Belum ada log aktivitas"
            description="Aktivitas tambah, ubah, hapus, dan verifikasi dari setiap halaman admin akan tercatat di sini."
          />
        )
      ) : (
        <>
          {/* Tampilan kartu untuk layar kecil */}
          <div className="space-y-3 md:hidden">
            {visible.map((row) => {
              const info = actionInfo(row.action);
              const roleLabel = ROLE_LABELS[row.actor_role] ?? row.actor_role;
              return (
                <article
                  key={`m-${row.id}`}
                  className="rounded-[24px] border border-admin-line bg-admin-canvas p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusChip tone={info.tone}>{info.label}</StatusChip>
                    <span className="rounded-full bg-admin-surface px-2.5 py-1 text-[11px] font-medium text-admin-text-secondary">
                      {moduleLabel(row.module)}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] font-medium leading-snug text-admin-ink">
                    {row.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-admin-line pt-2.5 text-[12px] text-admin-text-secondary">
                    <span className="inline-flex items-center gap-1.5 font-medium text-admin-ink">
                      {row.actor_username}
                      <span className="rounded-full bg-admin-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-admin-text-secondary">
                        {roleLabel}
                      </span>
                    </span>
                    <span className="font-mono text-[11px]">{formatWib(row.created_at)}</span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Tabel desktop */}
          <div className="hidden md:block">
            <DataTable caption="Log aktivitas CRUD admin" minWidth={820}>
              <thead>
                <tr>
                  <th scope="col">Waktu</th>
                  <th scope="col">Pengguna</th>
                  <th scope="col">Aksi</th>
                  <th scope="col">Modul</th>
                  <th scope="col">Aktivitas</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const info = actionInfo(row.action);
                  const roleLabel = ROLE_LABELS[row.actor_role] ?? row.actor_role;
                  return (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap font-mono text-[13px] text-admin-text-secondary">
                        {formatWib(row.created_at)}
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-medium text-admin-ink">{row.actor_username}</span>
                          <span className="rounded-full bg-admin-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-admin-text-secondary">
                            {roleLabel}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <StatusChip tone={info.tone}>{info.label}</StatusChip>
                      </td>
                      <td className="whitespace-nowrap text-[13px] text-admin-ink">
                        {moduleLabel(row.module)}
                      </td>
                      <td className="text-[14px] text-admin-ink">
                        <p className="leading-snug">{row.summary}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[13px] text-admin-text-secondary">
              <p>
                Menampilkan{" "}
                <span className="font-medium text-admin-ink tabular-nums">
                  {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filtered.length)}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-admin-ink tabular-nums">{filtered.length}</span>{" "}
                aktivitas
              </p>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-admin-line bg-admin-canvas px-3.5 text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-surface disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft aria-hidden="true" size={15} />
                  Sebelumnya
                </button>
                <span className="px-2 font-mono text-[12px] text-admin-ink tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-admin-line bg-admin-canvas px-3.5 text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-surface disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Berikutnya
                  <ChevronRight aria-hidden="true" size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
