import { DashboardView } from "@/components/admin/stats/DashboardView";
import { DashboardFilters } from "@/components/admin/stats/DashboardFilters";
import { PeriodSwitch } from "@/components/admin/stats/PeriodSwitch";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { buildDashboardStats, fetchFrom, parsePeriod, type DashboardInput } from "@/lib/server/admin-dashboard";
import { calendarSessions } from "@/lib/server/admin-calendar";
import { programTones } from "@/components/admin/calendar/AgendaList";

export const dynamic = "force-dynamic";

const PAGE = 1000;
type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/** PostgREST membatasi 1000 baris per select; ambil per halaman sampai habis. */
async function fetchAll<T>(page: (from: number, to: number) => Page<T>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw new Error(`Statistik gagal dimuat: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

type Items = { items: { batch_slug: string }[] };
// Relasi many-to-one datang sebagai objek; tanpa tipe hasil generate, supabase-js menebaknya larik.
type InvoiceRow = { total_idr: number; created_at: string; reviewed_at: string | null; stage: string; registration: Items | Items[] | null };
const withBatches = ({ registration, ...invoice }: InvoiceRow) => ({
  ...invoice,
  batches: [registration ?? []].flat().flatMap((row) => row.items.map((item) => item.batch_slug)),
});
const INVOICE = "id,total_idr,created_at,reviewed_at,stage,registration:academy_registrations(items:academy_registration_items(batch_slug))";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ periode?: string; program?: string; batch?: string }> }) {
  await requireAdminMember();
  const params = await searchParams;
  const period = parsePeriod(params.periode);
  const now = new Date();
  const since = fetchFrom(period, now).toISOString();
  const db = academyBillingClient();

  const [registrations, verified, pending, batches, programs] = await Promise.all([
    fetchAll<DashboardInput["registrations"][number]>((from, to) => db.from("academy_registrations")
      .select("id,received_at,payment_method,primary_batch_slug,answers,items:academy_registration_items(batch_slug),invoices:academy_invoices(status,total_idr,reviewed_at,created_at)")
      .gte("received_at", since).order("id").range(from, to)),
    fetchAll<InvoiceRow>((from, to) => db.from("academy_invoices").select(INVOICE).eq("status", "verified").gte("reviewed_at", since).order("id").range(from, to)),
    fetchAll<InvoiceRow>((from, to) => db.from("academy_invoices").select(INVOICE).eq("status", "pending").order("id").range(from, to)),
    db.from("batches").select("slug,title,program_slug,registration_open,sessions"),
    db.from("programs").select("slug,title").order("title"),
  ]);
  const failed = [batches, programs].find((result) => result.error);
  if (failed?.error) throw new Error(`Statistik gagal dimuat: ${failed.error.message}`);

  const batchRows = batches.data ?? [];
  const programRows = programs.data ?? [];
  // Slug dari URL hanya dipakai bila ada di katalog; batch harus milik program yang dipilih.
  const program = programRows.some((row) => row.slug === params.program) ? params.program! : null;
  const batch = batchRows.some((row) => row.slug === params.batch && (!program || row.program_slug === program)) ? params.batch! : null;

  const stats = buildDashboardStats({
    registrations,
    verifiedInvoices: verified.map(withBatches),
    pendingInvoices: pending.map(withBatches),
    batches: batchRows,
    programs: programRows,
  }, period, now, { program, batch });

  const agendaBatches = batchRows.filter((row) => (!program || row.program_slug === program) && (!batch || row.slug === batch));
  const agenda = calendarSessions(agendaBatches, programRows, now, new Date(now.getTime() + 14 * 86_400_000), now);

  return <>
    <PeriodSwitch value={period} />
    <DashboardFilters
      programs={programRows}
      batches={batchRows.map(({ slug, title, program_slug }) => ({ slug, title, program_slug }))}
      program={program}
      batch={batch}
    />
    <DashboardView stats={stats} agenda={agenda} filtered={!!(program || batch)} now={now.getTime()} tones={programTones(programRows)} />
  </>;
}
