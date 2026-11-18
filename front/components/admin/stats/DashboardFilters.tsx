"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { slug: string; title: string };
const trigger = "h-11 w-full rounded-full border-admin-line-strong bg-admin-surface px-4 text-[14px] sm:w-56";
// Radix Select tidak menerima nilai kosong; "all" berarti tanpa filter.
const ALL = "all";

/** Filter program → batch disimpan di URL agar bisa dibagikan dan bertahan saat ganti periode. */
export function DashboardFilters({ programs, batches, program, batch }: {
  programs: Option[]; batches: (Option & { program_slug: string })[]; program: string | null; batch: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const go = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const batchOptions = batches.filter((row) => !program || row.program_slug === program);

  return <div role="group" aria-label="Filter dashboard" className="mb-[var(--admin-gap-card)] flex flex-wrap items-center gap-3">
    <Select value={program ?? ALL} onValueChange={(value) => go({ program: value === ALL ? null : value, batch: null })}>
      <SelectTrigger aria-label="Program" className={trigger}><SelectValue /></SelectTrigger>
      <SelectContent className="rounded-2xl">
        <SelectItem value={ALL}>Semua program</SelectItem>
        {programs.map((row) => <SelectItem key={row.slug} value={row.slug}>{row.title}</SelectItem>)}
      </SelectContent>
    </Select>
    <Select value={batch ?? ALL} onValueChange={(value) => go({ batch: value === ALL ? null : value })}>
      <SelectTrigger aria-label="Batch" className={trigger}><SelectValue /></SelectTrigger>
      <SelectContent className="rounded-2xl">
        <SelectItem value={ALL}>Semua batch</SelectItem>
        {batchOptions.map((row) => <SelectItem key={row.slug} value={row.slug}>{row.title}</SelectItem>)}
      </SelectContent>
    </Select>
    {(program || batch) && <button type="button" onClick={() => go({ program: null, batch: null })} className="h-11 rounded-full px-4 text-[14px] text-admin-text-secondary hover:bg-admin-surface-muted hover:text-admin-ink">Hapus filter</button>}
  </div>;
}
