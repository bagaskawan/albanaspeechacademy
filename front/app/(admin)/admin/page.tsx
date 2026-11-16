import { DashboardView } from "@/components/admin/stats/DashboardView";
import { PeriodSwitch } from "@/components/admin/stats/PeriodSwitch";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { buildDashboardStats, fetchFrom, parsePeriod, type DashboardInput } from "@/lib/server/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  await requireAdminMember();
  const period = parsePeriod((await searchParams).periode);
  const now = new Date();
  const since = fetchFrom(period, now).toISOString();
  const db = academyBillingClient();

  // shortcut: PostgREST caps each select at 1000 rows; move aggregation to an SQL RPC once a period exceeds that.
  const [registrations, verified, pending, batches, programs] = await Promise.all([
    db.from("academy_registrations")
      .select("id,received_at,payment_method,primary_batch_slug,answers,items:academy_registration_items(batch_slug),invoices:academy_invoices(status,total_idr,reviewed_at,created_at)")
      .gte("received_at", since).limit(1000),
    db.from("academy_invoices").select("total_idr,reviewed_at").eq("status", "verified").gte("reviewed_at", since).limit(1000),
    db.from("academy_invoices").select("total_idr,created_at").eq("status", "pending").limit(1000),
    db.from("batches").select("slug,title,program_slug,registration_open"),
    db.from("programs").select("slug,title"),
  ]);
  const failed = [registrations, verified, pending, batches, programs].find((result) => result.error);
  if (failed?.error) throw new Error(`Statistik gagal dimuat: ${failed.error.message}`);

  const stats = buildDashboardStats({
    registrations: registrations.data as DashboardInput["registrations"],
    verifiedInvoices: verified.data ?? [],
    pendingInvoices: pending.data ?? [],
    batches: batches.data ?? [],
    programs: programs.data ?? [],
  }, period, now);

  return <>
    <PeriodSwitch value={period} />
    <DashboardView stats={stats} />
  </>;
}
