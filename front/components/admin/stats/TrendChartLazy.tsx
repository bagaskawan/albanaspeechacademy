"use client";

import dynamic from "next/dynamic";

// recharts stays out of the initial admin bundle; the skeleton keeps the 260px slot.
export const TrendChartLazy = dynamic(() => import("./TrendChart"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="admin-skeleton mt-10 h-[260px] rounded-[var(--admin-radius-card-inner)]" />,
});
