"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Bucket = { label: string; registrations: number; verifiedIdr: number };

const rupiahShort = (value: number) => new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export default function TrendChart({ buckets, average }: { buckets: Bucket[]; average: number }) {
  const [showVerified, setShowVerified] = useState(false);
  const peak = buckets.reduce((best, bucket) => (bucket.registrations > best.registrations ? bucket : best), buckets[0]);
  return <figure className="m-0">
    <figcaption className="sr-only">{`${buckets.length} periode, rata-rata ${average} pendaftar, tertinggi ${peak?.registrations ?? 0} pada ${peak?.label ?? "-"}.`}</figcaption>
    <div className="mb-3 flex flex-wrap items-center justify-end gap-4 text-[13px] text-admin-text-secondary">
      <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full bg-admin-ink" />Pendaftar</span>
      <button type="button" aria-pressed={showVerified} onClick={() => setShowVerified(!showVerified)} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${showVerified ? "bg-admin-lilac-soft text-admin-lilac-ink" : "hover:bg-admin-surface-muted"}`}>
        <span aria-hidden="true" className="size-2 rounded-full bg-admin-lilac-dot" />Pembayaran terverifikasi
      </button>
    </div>
    <div aria-hidden="true" className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={buckets} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="admin-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--admin-butter-dot)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--admin-butter-dot)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--admin-line)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--admin-text-secondary)", fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis yAxisId="count" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--admin-text-secondary)", fontSize: 12 }} width={40} />
          <YAxis yAxisId="idr" orientation="right" hide={!showVerified} tickFormatter={rupiahShort} tickLine={false} axisLine={false} tick={{ fill: "var(--admin-text-secondary)", fontSize: 12 }} width={48} />
          <ReferenceLine yAxisId="count" y={average} stroke="var(--admin-text-faint)" strokeDasharray="4 4" />
          <Tooltip
            cursor={{ stroke: "var(--admin-line-strong)" }}
            contentStyle={{ background: "var(--admin-surface)", border: "1px solid var(--admin-line)", borderRadius: 16, boxShadow: "var(--admin-shadow-pop)", color: "var(--admin-ink)" }}
            formatter={(value, name) => (name === "verifiedIdr" ? [`Rp${Number(value).toLocaleString("id-ID")}`, "Terverifikasi"] : [value, "Pendaftar"])}
          />
          <Area yAxisId="count" type="monotone" dataKey="registrations" stroke="var(--admin-ink)" strokeWidth={2} fill="url(#admin-trend-fill)" />
          {showVerified && <Line yAxisId="idr" type="monotone" dataKey="verifiedIdr" stroke="var(--admin-lilac-dot)" strokeWidth={2} dot={false} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <p className="mt-2 text-[13px] text-admin-text-secondary">Rata-rata {average.toLocaleString("id-ID")} pendaftar per periode (garis putus-putus).</p>
  </figure>;
}
