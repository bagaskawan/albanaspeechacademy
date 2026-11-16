"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveAdminEmail } from "@/lib/admin-login";

export async function loginAdmin(identifier: string, password: string) {
  const email = resolveAdminEmail(identifier, { username: process.env.SUPABASE_ADMIN_USERNAME, email: process.env.SUPABASE_ADMIN_EMAIL });
  if (!email || !password) return { error: "Username atau kata sandi tidak valid." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Username atau kata sandi tidak valid." };
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Akun tidak memiliki akses CMS." };
  }
  return { error: null };
}
