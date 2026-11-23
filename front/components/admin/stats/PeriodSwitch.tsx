"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { m } from "motion/react";
import { AdminPageActions } from "@/components/admin/PageHeader";
import { transition } from "@/lib/motion/tokens";
import type { DashboardPeriod } from "@/lib/server/admin-dashboard";

const options: [DashboardPeriod, string][] = [["30d", "30 hari"], ["90d", "90 hari"], ["ytd", "Tahun ini"]];

export function PeriodSwitch({ value, action }: { value: DashboardPeriod; action?: React.ReactNode }) {
  const params = useSearchParams();
  // Pertahankan filter program/batch saat ganti periode.
  const hrefFor = (key: DashboardPeriod) => {
    const next = new URLSearchParams(params.toString());
    if (key === "30d") next.delete("periode");
    else next.set("periode", key);
    const query = next.toString();
    return query ? `/admin?${query}` : "/admin";
  };
  return <AdminPageActions>
    <div className="flex flex-wrap items-center gap-3">
      {action}
      <nav aria-label="Periode statistik" className="flex h-14 items-center gap-1 rounded-full bg-admin-surface p-1.5">
        {options.map(([key, label]) => <Link key={key} href={hrefFor(key)} scroll={false} aria-current={key === value ? "page" : undefined}
          className={`relative flex h-full items-center rounded-full px-4 text-[14px] ${key === value ? "font-medium text-admin-on-ink" : "text-admin-text-secondary hover:text-admin-ink"}`}>
          {key === value && <m.span layoutId="admin-period" className="absolute inset-0 rounded-full bg-admin-ink" transition={transition.pill} />}
          <span className="relative">{label}</span>
        </Link>)}
      </nav>
    </div>
  </AdminPageActions>;
}
