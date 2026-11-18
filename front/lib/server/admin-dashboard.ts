// Pure aggregation for the admin dashboard (plan 3.11). No I/O, so it runs under `node --test`.
// All day/week/month boundaries are WIB (UTC+7, no DST).

import { professionOptions } from "../demographics.ts";
import { batchStatus, fromStoredSessions, wibMs } from "../program-batch.ts";

export type DashboardPeriod = "30d" | "90d" | "ytd";
/** Saring dashboard ke satu program dan/atau satu batch (slug). */
export type DashboardFilter = { program?: string | null; batch?: string | null };

type Invoice = { status: string; total_idr: number; reviewed_at: string | null; created_at: string };
type Registration = {
  id: number; received_at: string; payment_method: string; primary_batch_slug: string | null;
  answers: Record<string, unknown> | null; items: { batch_slug: string }[]; invoices: Invoice[];
};
/** `batches`: batch pada registrasi tagihan ini; dipakai filter. Tanpa nilai berarti selalu ikut. */
type InvoiceRef = { batches?: string[] };
export type DashboardInput = {
  registrations: Registration[];
  /** Verified invoices by review date; defaults to the invoices on `registrations`. */
  verifiedInvoices?: (Pick<Invoice, "total_idr" | "reviewed_at"> & InvoiceRef)[];
  pendingInvoices: (Pick<Invoice, "total_idr" | "created_at"> & { stage?: string } & InvoiceRef)[];
  batches: { slug: string; title: string; program_slug: string; registration_open: boolean; sessions?: unknown }[];
  programs: { slug: string; title: string }[];
};

const DAY = 86_400_000;
const WIB = 7 * 3_600_000;

export const parsePeriod = (value: unknown): DashboardPeriod => (value === "90d" || value === "ytd" ? value : "30d");
export const wibDayKey = (date: Date) => new Date(date.getTime() + WIB).toISOString().slice(0, 10);
const wibMidnight = (date: Date) => new Date(Date.parse(`${wibDayKey(date)}T00:00:00Z`) - WIB);

export function periodRange(period: DashboardPeriod, now: Date) {
  const today = wibMidnight(now);
  const start = period === "ytd"
    ? new Date(Date.UTC(new Date(now.getTime() + WIB).getUTCFullYear(), 0, 1) - WIB)
    : new Date(today.getTime() - (period === "90d" ? 89 : 29) * DAY);
  const previousStart = new Date(start.getTime() - (now.getTime() - start.getTime()));
  return { start, previousStart };
}

/** Trend buckets: 12 Monday-start weeks, or calendar months for "ytd". */
export function trendStarts(period: DashboardPeriod, now: Date): Date[] {
  const local = new Date(now.getTime() + WIB);
  if (period === "ytd") {
    return Array.from({ length: local.getUTCMonth() + 1 }, (_, month) => new Date(Date.UTC(local.getUTCFullYear(), month, 1) - WIB));
  }
  const monday = wibMidnight(now).getTime() - ((local.getUTCDay() + 6) % 7) * DAY;
  return Array.from({ length: 12 }, (_, index) => new Date(monday - (11 - index) * 7 * DAY));
}

/** Earliest timestamp the page must fetch for every figure. */
export const fetchFrom = (period: DashboardPeriod, now: Date) =>
  new Date(Math.min(periodRange(period, now).previousStart.getTime(), trendStarts(period, now)[0].getTime()));

const isActive = (registration: Registration) => !registration.invoices.some((invoice) => invoice.status === "rejected" || invoice.status === "cancelled");
const isSettled = (registration: Registration) => registration.invoices.length > 0 && registration.invoices.every((invoice) => invoice.status === "verified");
const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const within = (iso: string | null, from: Date, to: Date) => iso !== null && Date.parse(iso) >= from.getTime() && Date.parse(iso) < to.getTime();

function group(rows: (string | null)[], labels: [string, string][]) {
  const answered = rows.filter((row): row is string => row !== null);
  return {
    n: answered.length,
    enough: answered.length >= 5,
    rows: labels.map(([key, label]) => {
      const count = answered.filter((row) => row === key).length;
      return { label, count, percent: percent(count, answered.length) };
    }),
  };
}

function ageBucket(value: unknown) {
  const age = Number(value);
  if (!Number.isFinite(age) || age <= 0) return null;
  return age < 25 ? "<25" : age < 35 ? "25-34" : age < 45 ? "35-44" : "45+";
}

/** Kelompok dinamis: `limit` nilai terbanyak, sisanya "Lainnya". */
function topGroup(rows: (string | null)[], limit: number) {
  const answered = rows.filter((row): row is string => row !== null);
  const counts = new Map<string, number>();
  for (const row of answered) counts.set(row, (counts.get(row) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id"));
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((sum, [, count]) => sum + count, 0);
  if (rest) top.push(["Lainnya", rest]);
  return {
    n: answered.length,
    enough: answered.length >= 5,
    rows: top.map(([label, count]) => ({ label, count, percent: percent(count, answered.length) })),
  };
}

export function buildDashboardStats(input: DashboardInput, period: DashboardPeriod, now: Date, filter: DashboardFilter = {}) {
  const { start, previousStart } = periodRange(period, now);
  const end = new Date(now.getTime() + 1);
  const programOf = new Map(input.batches.map((batch) => [batch.slug, batch.program_slug]));
  const keepBatch = (slug: string) => (!filter.batch || slug === filter.batch) && (!filter.program || programOf.get(slug) === filter.program);
  const keep = (slugs: string[] | undefined) => !slugs || slugs.some(keepBatch);
  const filtered = !!(filter.batch || filter.program);
  const registrations = filtered ? input.registrations.filter((row) => keep(row.items.map((item) => item.batch_slug))) : input.registrations;
  const pendingInvoices = input.pendingInvoices.filter((invoice) => keep(invoice.batches));
  const current = registrations.filter((row) => within(row.received_at, start, end));
  const previous = registrations.filter((row) => within(row.received_at, previousStart, start));
  const verifiedInvoices = input.verifiedInvoices?.filter((invoice) => keep(invoice.batches))
    ?? registrations.flatMap((row) => row.invoices.filter((invoice) => invoice.status === "verified"));
  const sumVerified = (from: Date, to: Date) => verifiedInvoices.filter((invoice) => within(invoice.reviewed_at, from, to)).reduce((sum, invoice) => sum + invoice.total_idr, 0);

  const days = Math.max(1, Math.round((wibMidnight(now).getTime() - start.getTime()) / DAY) + 1);
  const dailyRegistrations = new Array<number>(days).fill(0);
  const dailyVerified = new Array<number>(days).fill(0);
  const dayIndex = (iso: string) => Math.floor((Date.parse(iso) - start.getTime()) / DAY);
  for (const row of current) dailyRegistrations[dayIndex(row.received_at)] += 1;
  for (const invoice of verifiedInvoices) if (within(invoice.reviewed_at, start, end)) dailyVerified[dayIndex(invoice.reviewed_at!)] += invoice.total_idr;

  const verifiedNow = sumVerified(start, end);
  const verifiedBefore = sumVerified(previousStart, start);
  const oldestPending = pendingInvoices.reduce((oldest, invoice) => Math.min(oldest, Date.parse(invoice.created_at)), Infinity);

  const batchBySlug = new Map(input.batches.map((batch) => [batch.slug, batch]));
  const programBySlug = new Map(input.programs.map((program) => [program.slug, program]));
  const active = current.filter(isActive);

  const perBatch = new Map<string, { active: number; verified: number; partial: number }>();
  const perProgram = new Map<string, Set<number>>();
  for (const row of active) {
    for (const item of row.items) {
      if (!keepBatch(item.batch_slug)) continue;
      const entry = perBatch.get(item.batch_slug) ?? { active: 0, verified: 0, partial: 0 };
      entry.active += 1;
      if (isSettled(row)) entry.verified += 1;
      else if (row.invoices.some((invoice) => invoice.status === "verified")) entry.partial += 1;
      perBatch.set(item.batch_slug, entry);
      const programSlug = batchBySlug.get(item.batch_slug)?.program_slug;
      if (programSlug) perProgram.set(programSlug, (perProgram.get(programSlug) ?? new Set()).add(row.id));
    }
  }

  const starts = trendStarts(period, now);
  const bucketIndex = (iso: string | null) => {
    if (!iso) return -1;
    const time = Date.parse(iso);
    for (let index = starts.length - 1; index >= 0; index -= 1) if (time >= starts[index].getTime()) return time < end.getTime() ? index : -1;
    return -1;
  };
  const buckets = starts.map((bucketStart) => ({
    label: new Intl.DateTimeFormat("id-ID", period === "ytd" ? { month: "short", timeZone: "Asia/Jakarta" } : { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(bucketStart),
    registrations: 0,
    verifiedIdr: 0,
  }));
  for (const row of registrations) { const index = bucketIndex(row.received_at); if (index >= 0) buckets[index].registrations += 1; }
  for (const invoice of verifiedInvoices) { const index = bucketIndex(invoice.reviewed_at); if (index >= 0) buckets[index].verifiedIdr += invoice.total_idr; }

  const answer = (row: Registration, key: string) => (row.answers ?? {})[key];
  return {
    period,
    registrations: { current: current.length, previous: previous.length, delta: current.length - previous.length, daily: dailyRegistrations },
    verified: { current: verifiedNow, previous: verifiedBefore, deltaPercent: verifiedBefore ? Math.round(((verifiedNow - verifiedBefore) / verifiedBefore) * 100) : null, daily: dailyVerified },
    pending: {
      count: pendingInvoices.length,
      total: pendingInvoices.reduce((sum, invoice) => sum + invoice.total_idr, 0),
      remainingCount: pendingInvoices.filter((invoice) => invoice.stage === "remaining").length,
      remainingTotal: pendingInvoices.filter((invoice) => invoice.stage === "remaining").reduce((sum, invoice) => sum + invoice.total_idr, 0),
      oldestDays: Number.isFinite(oldestPending) ? Math.floor((now.getTime() - oldestPending) / DAY) : null,
    },
    settlement: { current: percent(current.filter(isSettled).length, current.length), previous: percent(previous.filter(isSettled).length, previous.length) },
    openBatches: input.batches.filter((batch) => batch.registration_open && keepBatch(batch.slug)).length,
    trend: {
      buckets,
      averageRegistrations: Math.round((buckets.reduce((sum, bucket) => sum + bucket.registrations, 0) / buckets.length) * 10) / 10,
    },
    // Batch dibuka atau yang punya pendaftar aktif pada periode; dibuka dulu, lalu jumlah pendaftar.
    topBatches: [...new Set([...input.batches.filter((batch) => batch.registration_open && keepBatch(batch.slug)).map((batch) => batch.slug), ...perBatch.keys()])]
      .map((slug) => {
        const entry = perBatch.get(slug) ?? { active: 0, verified: 0, partial: 0 };
        const batch = batchBySlug.get(slug);
        const first = fromStoredSessions(batch?.sessions)[0];
        return {
          slug,
          title: batch?.title ?? slug,
          program: programBySlug.get(batch?.program_slug ?? "")?.title ?? "",
          programSlug: batch?.program_slug ?? null,
          status: batch ? batchStatus({ registration_open: batch.registration_open, sessions: batch.sessions }, now.getTime()) : "closed",
          startsAt: first ? wibMs(`${first.date}T${first.start}`) : null,
          active: entry.active,
          verified: entry.verified,
          partial: entry.partial,
          paidPercent: percent(entry.verified, entry.active),
        };
      })
      .sort((a, b) => Number(b.status === "open") - Number(a.status === "open") || b.active - a.active || b.verified - a.verified)
      .slice(0, 8),
    perProgram: [...perProgram.entries()]
      .map(([slug, ids]) => ({ slug, title: programBySlug.get(slug)?.title ?? slug, count: ids.size }))
      .sort((a, b) => b.count - a.count),
    composition: {
      source: group(current.map((row) => {
        const value = answer(row, "source");
        return typeof value === "string" && value ? value : null;
      }), [["instagram", "Instagram"], ["whatsapp", "WhatsApp"], ["referral", "Teman/Kerabat"], ["other", "Lainnya"]]),
      age: group(current.map((row) => ageBucket(answer(row, "age"))), [["<25", "< 25"], ["25-34", "25–34"], ["35-44", "35–44"], ["45+", "≥ 45"]]),
      gender: group(current.map((row) => {
        const value = answer(row, "gender");
        return value === "Perempuan" || value === "Laki-laki" ? value : null;
      }), [["Perempuan", "Perempuan"], ["Laki-laki", "Laki-laki"]]),
      experience: group(current.map((row) => {
        const value = answer(row, "priorExperience");
        return typeof value === "boolean" ? String(value) : null;
      }), [["true", "Pernah pelatihan"], ["false", "Belum pernah"]]),
      domicile: topGroup(current.map((row) => {
        const value = answer(row, "domicile");
        return typeof value === "string" && value.trim() ? value.trim() : null;
      }), 7),
      profession: group(current.map((row) => {
        const value = answer(row, "professionCategory");
        return typeof value === "string" && value ? value : null;
      }), professionOptions.map((option): [string, string] => [option.value, option.label])),
      payment: group(current.map((row) => (row.payment_method === "full" || row.payment_method === "dp" ? row.payment_method : null)), [["full", "Lunas"], ["dp", "DP"]]),
    },
  };
}

export type DashboardStats = ReturnType<typeof buildDashboardStats>;
