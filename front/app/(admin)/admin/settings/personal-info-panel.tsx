import { requireAdminMember } from "@/lib/server/admin-guard";
import { PersonalInfoClient } from "./PersonalInfoClient";

const ROLE_LABELS: Record<string, string> = {
  adminsuper: "Super Admin",
  admin: "Admin",
};

export async function PersonalInfoPanel() {
  const supabase = await requireAdminMember();
  const username =
    supabase.adminUser.username ??
    process.env.SUPABASE_ADMIN_USERNAME?.trim() ??
    "—";
  const roleLabel = ROLE_LABELS[supabase.adminUser.role] ?? supabase.adminUser.role;

  return <PersonalInfoClient username={username} roleLabel={roleLabel} />;
}
