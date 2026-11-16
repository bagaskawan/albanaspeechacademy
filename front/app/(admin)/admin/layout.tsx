import { AdminShell } from "@/components/admin/shell/AdminShell";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await requireAdminMember();
  const pendingInvoices = await countPendingInvoices();
  return <AdminShell pendingInvoices={pendingInvoices} role={supabase.adminUser.role} account={process.env.SUPABASE_ADMIN_USERNAME?.trim() || supabase.adminEmail}>{children}</AdminShell>;
}

// The badge is a hint; a billing outage must not take the whole CMS down.
async function countPendingInvoices() {
  try {
    const { count } = await academyBillingClient().from("academy_invoices").select("id", { count: "exact", head: true }).eq("status", "pending");
    return count ?? 0;
  } catch {
    return 0;
  }
}
