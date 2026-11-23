import { AdminShell } from "@/components/admin/shell/AdminShell";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { readAdminLiveCounts } from "@/lib/server/admin-live-counts";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await requireAdminMember();
  const { pendingInvoices, verifiedRegistrants } = await readAdminLiveCounts();
  return (
    <AdminShell
      pendingInvoices={pendingInvoices}
      verifiedRegistrants={verifiedRegistrants}
      role={supabase.adminUser.role}
      account={supabase.adminUser.username ?? process.env.SUPABASE_ADMIN_USERNAME?.trim() ?? null}
    >
      {children}
    </AdminShell>
  );
}
