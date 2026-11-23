import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DashboardStats } from "@/lib/server/admin-dashboard";
import type { CalendarSession } from "@/lib/server/admin-calendar";
import { AgendaList, type ProgramTones } from "@/components/admin/calendar/AgendaList";
import { TrendChartLazy } from "./TrendChartLazy";

const card = "rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]";
const periodWord = { "30d": "30 hari sebelumnya", "90d": "90 hari sebelumnya", ytd: "periode sebelumnya" } as const;

/** §2.2 layered number: the part after the last thousands dot is faint; screen readers get the whole value. */
function Rupiah({ value, className = "" }: { value: number; className?: string }) {
  const text = `Rp${value.toLocaleString("id-ID")}`;
  const cut = text.lastIndexOf(".");
  return <span aria-label={text} className={`tabular-nums ${className}`}>
    <span aria-hidden="true">{cut > 0 ? text.slice(0, cut + 1) : text}</span>
    {cut > 0 && <span aria-hidden="true" className="text-admin-text-faint">{text.slice(cut + 1)}</span>}
  </span>;
}

function Chip({ tone, children }: { tone: "butter" | "peach" | "mint" | "rose" | "lilac"; children: React.ReactNode }) {
  const tones = {
    butter: "bg-admin-butter-soft text-admin-butter-ink",
    peach: "bg-admin-peach-soft text-admin-peach-ink",
    mint: "bg-admin-mint-soft text-admin-mint-ink",
    rose: "bg-admin-rose-soft text-admin-rose-ink",
    lilac: "bg-admin-lilac-soft text-admin-lilac-ink",
  };
  return <span className={`inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[12px] font-medium ${tones[tone]}`}>{children}</span>;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2 || values.every((value) => value === 0)) return null;
  const max = Math.max(...values);
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${36 - (value / max) * 32}`).join(" ");
  return <svg aria-hidden="true" viewBox="0 0 100 40" className="h-10 w-[88px] shrink-0 overflow-visible sm:w-[100px]">
    <polyline points={points} fill="none" stroke="var(--admin-butter-dot)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function StatCard({ value, label, chip, spark, href }: { value: React.ReactNode; label: string; chip?: React.ReactNode; spark?: number[]; href?: string }) {
  return <section className={`${card} flex min-h-[188px] flex-col justify-between gap-4`}>
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 text-[28px] font-normal leading-none tracking-[-0.02em] sm:text-[34px] xl:text-[40px]">{value}</p>
        {spark ? <Sparkline values={spark} /> : href && <OpenLink href={href} label={label} />}
      </div>
      <h2 className="mt-3 text-[15px] text-admin-text-secondary">{label}</h2>
    </div>
    {chip}
  </section>;
}

function OpenLink({ href, label, inverse = false }: { href: string; label: string; inverse?: boolean }) {
  return <Link href={href} aria-label={`Buka ${label}`} className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${inverse ? "bg-admin-on-ink/10 text-admin-on-ink hover:bg-admin-on-ink/20 focus-visible:outline-admin-on-ink" : "border border-admin-line-strong hover:bg-admin-surface-muted focus-visible:outline-admin-ink"}`}>
    <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.5} />
  </Link>;
}

function Bars({ title, hint, group }: { title: string; hint: string; group: DashboardStats["composition"]["source"] }) {
  return <section className={card}>
    <div className="flex items-start justify-between gap-3">
      <div><h2 className="text-[17px] font-medium">{title}</h2><p className="mt-1 text-[13px] text-admin-text-secondary">{hint}</p></div>
      <Chip tone="lilac">n = {group.n}</Chip>
    </div>
    {group.enough
      ? <ul className="mt-6 space-y-4">{group.rows.map((row) => <li key={row.label}>
          <div className="flex items-baseline justify-between gap-3 text-[14px]"><span>{row.label}</span><span className="font-mono text-[12px] text-admin-text-secondary">{row.percent}% ({row.count})</span></div>
          <div aria-hidden="true" className="admin-pattern-empty mt-2 h-2 overflow-hidden rounded-full"><div className="h-full rounded-full bg-admin-ink" style={{ width: `${row.percent}%` }} /></div>
        </li>)}</ul>
      : <p className="mt-6 text-[14px] text-admin-text-secondary">Data belum cukup (perlu minimal 5 jawaban).</p>}
  </section>;
}

function SplitBar({ group }: { group: DashboardStats["composition"]["gender"] }) {
  const [left, right] = group.rows;
  return <li>
    <div className="flex justify-between gap-3 text-[14px]"><span>{left.label} <span className="font-mono text-[12px] text-admin-text-secondary">{left.percent}%</span></span><span><span className="font-mono text-[12px] text-admin-text-secondary">{right.percent}%</span> {right.label}</span></div>
    <div aria-hidden="true" className="mt-2 flex h-2 overflow-hidden rounded-full bg-admin-surface-muted">
      <div className="h-full bg-admin-ink" style={{ width: `${left.percent}%` }} />
      <div className="h-full bg-admin-lilac-dot" style={{ width: `${right.percent}%` }} />
    </div>
  </li>;
}

const DAY = 86_400_000;
const dateShort = new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
const statusLabel = { open: "Dibuka", closed: "Ditutup", done: "Selesai" } as const;

/** Hal yang perlu ditindaklanjuti admin; kosong berarti strip tidak tampil. */
function actionItems(stats: DashboardStats, agenda: CalendarSession[], now: number) {
  const items: { text: string; href: string }[] = [];
  if (stats.pending.count) items.push({ text: `${stats.pending.count} tagihan menunggu dicek${stats.pending.oldestDays ? ` (tertua ${stats.pending.oldestDays} hari)` : ""}`, href: "/admin/tagihan?status=pending" });
  if (stats.pending.remainingCount) items.push({ text: `${stats.pending.remainingCount} tagihan pelunasan belum dibayar`, href: "/admin/tagihan?status=pending" });
  const starting = agenda.filter((session) => session.sequence === 1 && session.startsAt - now < 7 * DAY);
  for (const session of starting.slice(0, 2)) {
    const days = Math.max(0, Math.ceil((session.startsAt - now) / DAY));
    items.push({ text: `${session.batchTitle} mulai ${days === 0 ? "hari ini" : `${days} hari lagi`} (${dateShort.format(session.startsAt)})`, href: `/admin/program/${session.programSlug}` });
  }
  return items;
}

export function DashboardView({ stats, agenda, filtered, now, tones }: { stats: DashboardStats; agenda: CalendarSession[]; filtered: boolean; now: number; tones: ProgramTones }) {
  const { registrations, verified, pending, trend, topBatches, composition, perProgram } = stats;
  const profile = [composition.gender, composition.experience, composition.payment];
  const profileN = Math.min(...profile.map((group) => group.n));
  const actions = actionItems(stats, agenda, now);
  const hasTrend = trend.buckets.some((bucket) => bucket.registrations > 0 || bucket.verifiedIdr > 0);

  return <div className="space-y-[var(--admin-gap-card)]">
    {registrations.current === 0 && registrations.previous === 0 && !filtered && <p className={`${card} text-[15px] text-admin-text-secondary`}>
      Belum ada pendaftar. Buka batch di <Link href="/admin/program/public-speaking-series" className="font-medium text-admin-ink underline underline-offset-4">Public Training</Link>.
    </p>}

    {actions.length > 0 && <section aria-labelledby="dashboard-actions" className={`${card} border border-admin-peach-dot/40`}>
      <h2 id="dashboard-actions" className="text-[15px] font-medium">Perlu tindakan</h2>
      <ul className="mt-3 space-y-2 text-[14px]">{actions.map((item) => <li key={item.text}>
        <Link href={item.href} className="inline-flex items-center gap-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-admin-ink">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-admin-peach-dot" />{item.text}<ArrowUpRight aria-hidden="true" size={14} />
        </Link>
      </li>)}</ul>
    </section>}

    <div className="grid gap-[var(--admin-gap-card)] md:grid-cols-3">
      <StatCard value={registrations.current.toLocaleString("id-ID")} label="Pendaftar" spark={registrations.daily}
        chip={<p className="flex flex-wrap items-center gap-2 text-[13px] text-admin-text-secondary"><Chip tone="butter">{registrations.delta >= 0 ? "+" : ""}{registrations.delta}</Chip>dibanding {periodWord[stats.period]}</p>} />
      <StatCard value={<Rupiah value={verified.current} />} label="Pembayaran terverifikasi" spark={verified.daily}
        chip={<p className="flex flex-wrap items-center gap-2 text-[13px] text-admin-text-secondary">{verified.deltaPercent === null ? "Belum ada pembanding" : <><Chip tone="butter">{verified.deltaPercent >= 0 ? "+" : ""}{verified.deltaPercent}%</Chip>dibanding {periodWord[stats.period]}</>}</p>} />
      <section className={`${card} flex min-h-[188px] flex-col justify-between gap-4 !bg-admin-ink text-admin-on-ink`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[28px] font-normal leading-none tracking-[-0.02em] sm:text-[34px] xl:text-[40px]">{pending.count}</p>
            <h2 className="mt-3 text-[15px] opacity-70">Tagihan menunggu · <Rupiah value={pending.total} className="[&>span:last-child]:text-current [&>span:last-child]:opacity-60" /></h2>
          </div>
          <OpenLink href="/admin/tagihan?status=pending" label="tagihan menunggu" inverse />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pending.oldestDays === null ? <p className="text-[13px] opacity-70">Semua tagihan sudah dicek</p> : <Chip tone="peach">Tertua {pending.oldestDays} hari</Chip>}
          {pending.remainingCount > 0 && <p className="text-[13px] opacity-70">{pending.remainingCount} pelunasan · <Rupiah value={pending.remainingTotal} className="[&>span:last-child]:text-current [&>span:last-child]:opacity-60" /></p>}
        </div>
      </section>
    </div>

    <div className="grid gap-[var(--admin-gap-card)] xl:grid-cols-3">
      <section className={`${card} xl:col-span-2`}>
        <h2 className="text-[17px] font-medium">{stats.period === "ytd" ? "Pendaftar per bulan" : "Pendaftar per minggu"}</h2>
        <p className="mt-1 text-[13px] text-admin-text-secondary">{stats.period === "ytd" ? "Sejak Januari" : "12 minggu terakhir"}</p>
        {hasTrend
          ? <TrendChartLazy buckets={trend.buckets} average={trend.averageRegistrations} />
          : <p className="admin-pattern-empty mt-6 flex h-[200px] items-center justify-center rounded-[var(--admin-radius-card)] px-6 text-center text-[14px] text-admin-text-secondary">
              Belum ada pendaftar atau pembayaran pada {stats.period === "ytd" ? "tahun ini" : "12 minggu terakhir"}.
            </p>}
      </section>
      <section className={card}>
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-[17px] font-medium">Agenda 14 hari</h2><p className="mt-1 text-[13px] text-admin-text-secondary">Sesi dari jadwal batch</p></div>
          <OpenLink href="/admin/kalender" label="kalender" />
        </div>
        <AgendaList sessions={agenda} tones={tones} empty="Tidak ada sesi dalam 14 hari ke depan." className="mt-5" />
      </section>
    </div>

    <section className={card}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-[17px] font-medium">Kinerja batch</h2><p className="mt-1 text-[13px] text-admin-text-secondary">Batch dibuka dan batch dengan pendaftar pada periode ini</p></div>
        <Chip tone="lilac">{topBatches.length} batch</Chip>
      </div>
      {topBatches.length === 0
        ? <p className="mt-6 text-[14px] text-admin-text-secondary">Belum ada batch dibuka atau pendaftar aktif pada periode ini.</p>
        : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[640px] text-[14px]">
            <thead><tr className="text-left text-[12px] text-admin-text-secondary">
              <th scope="col" className="pb-3 font-normal">Batch</th><th scope="col" className="pb-3 font-normal">Mulai</th><th scope="col" className="pb-3 font-normal">Status</th>
              <th scope="col" className="pb-3 text-right font-normal">Pendaftar</th><th scope="col" className="pb-3 text-right font-normal">Baru DP</th><th scope="col" className="pb-3 text-right font-normal">Lunas</th>
            </tr></thead>
            <tbody>{topBatches.map((row) => <tr key={row.slug} className="border-t border-admin-line">
              <td className="max-w-0 py-3 pr-3"><Link href={row.programSlug ? `/admin/program/${row.programSlug}` : "/admin"} className="block truncate font-medium hover:underline">{row.title}</Link><p className="truncate text-[12px] text-admin-text-secondary">{row.program}</p></td>
              <td className="whitespace-nowrap py-3 pr-3 text-admin-text-secondary">{row.startsAt === null ? "—" : dateShort.format(row.startsAt)}</td>
              <td className="py-3 pr-3"><Chip tone={row.status === "open" ? "mint" : row.status === "done" ? "lilac" : "peach"}>{statusLabel[row.status]}</Chip></td>
              <td className="py-3 text-right font-mono tabular-nums">{row.active}</td>
              <td className="py-3 text-right font-mono tabular-nums">{row.partial}</td>
              <td className="py-3 pl-2 text-right"><span className="font-mono tabular-nums">{row.verified}</span> <span className="text-[12px] text-admin-text-secondary">({row.paidPercent}%)</span></td>
            </tr>)}</tbody>
          </table></div>}
    </section>

    <h2 className="pt-2 text-[20px] font-medium">Demografi peserta</h2>
    <div className="grid gap-[var(--admin-gap-card)] lg:grid-cols-3">
      <Bars title="Sumber informasi" hint="Dari mana peserta mengetahui pelatihan" group={composition.source} />
      <Bars title="Usia" hint="Kelompok usia pendaftar" group={composition.age} />
      <section className={card}>
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-[17px] font-medium">Profil</h2><p className="mt-1 text-[13px] text-admin-text-secondary">Komposisi pendaftar periode ini</p></div>
          <Chip tone="lilac">n = {profileN}</Chip>
        </div>
        {profileN >= 5
          ? <ul className="mt-6 space-y-5">{profile.map((group) => <SplitBar key={group.rows[0].label} group={group} />)}</ul>
          : <p className="mt-6 text-[14px] text-admin-text-secondary">Data belum cukup (perlu minimal 5 jawaban).</p>}
      </section>
      <Bars title="Domisili" hint="Kota atau kabupaten terbanyak" group={composition.domicile} />
      <Bars title="Profesi" hint="Kategori profesi pendaftar" group={composition.profession} />
      <section className={card}>
        <h2 className="text-[17px] font-medium">Per program</h2>
        <p className="mt-1 text-[13px] text-admin-text-secondary">Pendaftar aktif periode ini</p>
        {perProgram.length === 0
          ? <p className="mt-6 text-[14px] text-admin-text-secondary">Belum ada pendaftar aktif.</p>
          : <ul className="mt-6 space-y-3 text-[14px]">{perProgram.map((row) => <li key={row.slug} className="flex justify-between gap-3"><span className="truncate">{row.title}</span><span className="font-mono tabular-nums">{row.count}</span></li>)}</ul>}
      </section>
    </div>
  </div>;
}
