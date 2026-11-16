import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminUserRecord = {
  user_id: string;
  role: "admin" | "adminsuper" | string;
};

/** Server-side guard for Albana CMS pages. */
export async function requireAdminMember(requiredRole?: "adminsuper") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/");

  if (requiredRole && admin.role !== requiredRole) {
    throw new Error("Aksi ini memerlukan hak akses adminsuper.");
  }

  return Object.assign(supabase, {
    adminUser: admin as AdminUserRecord,
  });
}
