import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminUserRecord = {
  user_id: string;
  role: "admin" | "adminsuper" | string;
  username: string | null;
};

// One auth + admin_users lookup per request, shared by the layout, the page and its actions.
// getClaims() verifies the JWT locally (falls back to the Auth server for legacy secrets).
const loadAdmin = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { supabase, userId: null, admin: null, email: null };
  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id, role, username")
    .eq("user_id", userId)
    .maybeSingle();
  return { supabase, userId, admin, email: typeof data.claims.email === "string" ? data.claims.email : null };
});

/** Server-side guard for Albana CMS pages. */
export async function requireAdminMember(requiredRole?: "adminsuper") {
  const { supabase, userId, admin, email } = await loadAdmin();
  if (!userId) redirect("/login");
  if (!admin) redirect("/");

  if (requiredRole && admin.role !== requiredRole) {
    throw new Error("Aksi ini memerlukan hak akses adminsuper.");
  }

  return Object.assign(supabase, {
    adminUser: admin as AdminUserRecord,
    adminEmail: email,
  });
}
