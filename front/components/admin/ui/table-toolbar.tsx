"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, Loader2, Plus, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AdminPageActions } from "@/components/admin/PageHeader";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ToolbarFilter = { param: string; label: string; options: { value: string; label: string }[] };

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";
const roundTool = `relative inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-admin-surface text-admin-ink transition-colors hover:bg-admin-surface-muted ${focusRing}`;

/** Table toolbar template (admin-ui-patterns §8.2): Cari · Saring · Ekspor · Tambah, fixed order, state in the URL. */
export function TableToolbar({ search, filters = [], exportModule, create }: {
  search?: { placeholder: string };
  filters?: ToolbarFilter[];
  exportModule?: string;
  create?: { label: string; href?: string; onClick?: () => void; icon?: React.ReactNode };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [exporting, setExporting] = useState(false);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (!search || query === urlQuery) return;
    const timer = window.setTimeout(() => setParam("q", query.trim()), 250);
    return () => window.clearTimeout(timer);
    // setParam reads the latest params; re-running on them would re-arm the timer for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function runExport() {
    if (!exportModule) return;
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/export/${exportModule}?${params.toString()}`);
      if (!response.ok) throw new Error((await response.text()) || "Ekspor gagal.");
      const blob = await response.blob();
      const name = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") ?? "")?.[1] ?? `albana-${exportModule}.csv`;
      const url = URL.createObjectURL(blob);
      const anchor = Object.assign(document.createElement("a"), { href: url, download: name });
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Ekspor siap.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ekspor gagal.");
    } finally {
      setExporting(false);
    }
  }

  const activeFilters = filters.filter((filter) => params.get(filter.param)).length;
  const createClass = `inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-admin-ink px-5 text-[15px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft max-md:size-12 max-md:justify-center max-md:px-0 ${focusRing}`;
  const createContent = create && <>{create.icon ?? <Plus aria-hidden="true" size={18} strokeWidth={1.5} />}<span className="max-md:sr-only">{create.label}</span></>;

  return <AdminPageActions>
    <div className="flex flex-wrap items-center gap-2">
      {search && <label className="relative flex h-12 w-full items-center sm:w-[280px]">
        <span className="sr-only">Cari</span>
        <Search aria-hidden="true" size={18} strokeWidth={1.5} className="pointer-events-none absolute left-4 text-admin-text-secondary" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }}
          placeholder={search.placeholder}
          className="h-12 w-full rounded-full border-0 bg-admin-surface pl-11 pr-4 text-[14px] text-admin-ink placeholder:text-admin-text-secondary focus-visible:outline-2 focus-visible:outline-admin-ink"
        />
      </label>}

      {filters.length > 0 && <DropdownMenu>
        <DropdownMenuTrigger aria-label={activeFilters ? `Saring (${activeFilters} aktif)` : "Saring"} title="Saring" className={roundTool}>
          <SlidersHorizontal aria-hidden="true" size={18} strokeWidth={1.5} />
          {activeFilters > 0 && <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 inline-flex size-5 items-center justify-center rounded-full bg-admin-ink text-[11px] font-medium text-admin-on-ink">{activeFilters}</span>}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-60 rounded-[20px] border-admin-line bg-admin-surface p-2 shadow-[var(--admin-shadow-pop)]">
          {filters.map((filter, index) => <div key={filter.param}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-[12px] font-medium text-admin-text-secondary">{filter.label}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={params.get(filter.param) ?? ""} onValueChange={(value) => setParam(filter.param, value)}>
              <DropdownMenuRadioItem value="">Semua</DropdownMenuRadioItem>
              {filter.options.map((option) => <DropdownMenuRadioItem key={option.value} value={option.value}>{option.label}</DropdownMenuRadioItem>)}
            </DropdownMenuRadioGroup>
          </div>)}
        </DropdownMenuContent>
      </DropdownMenu>}

      {exportModule && <button type="button" onClick={() => void runExport()} disabled={exporting} aria-label="Ekspor CSV"
        className={`inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-admin-line-strong px-5 text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface disabled:opacity-60 max-md:size-12 max-md:justify-center max-md:px-0 ${focusRing}`}>
        {exporting ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Download aria-hidden="true" size={18} strokeWidth={1.5} />}
        <span className="max-md:sr-only">{exporting ? "Menyiapkan…" : "Ekspor"}</span>
      </button>}

      {create && (create.href
        ? <Link href={create.href} className={createClass}>{createContent}</Link>
        : <button type="button" onClick={create.onClick} className={createClass}>{createContent}</button>)}
    </div>
  </AdminPageActions>;
}

/** Same matching the toolbar promises: case-insensitive substring. */
export const matchesQuery = (value: unknown, query: string) => !query || String(value ?? "").toLowerCase().includes(query.toLowerCase());
