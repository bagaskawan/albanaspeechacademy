import { redirect } from "next/navigation";
import { academyBillingClient } from "@/lib/server/academy-billing";
import type { AdminActivityLogRow } from "@/lib/server/admin-activity";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { UserActivityClient } from "./UserActivityClient";

export const dynamic = "force-dynamic";

export default async function UserActivityPage() {
  const supabase = await requireAdminMember();
  if (supabase.adminUser.role !== "adminsuper") {
    redirect("/admin");
  }

  const { data, error } = await academyBillingClient()
    .from("admin_activity_logs")
    .select(
      "id, actor_user_id, actor_username, actor_role, action, module, entity_id, entity_label, summary, metadata, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div role="alert" className="rounded-2xl bg-admin-rose-soft px-4 py-3 text-[13px] font-medium text-admin-rose-ink">
        Riwayat aktivitas admin belum bisa dimuat: {error.message}
      </div>
    );
  }

  return <UserActivityClient logs={(data ?? []) as AdminActivityLogRow[]} />;
}
