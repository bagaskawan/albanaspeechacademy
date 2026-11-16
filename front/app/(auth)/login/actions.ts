"use server";

import { createClient } from "@/lib/supabase/server";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { parseAdminCredentials, resolveAdminEmail } from "@/lib/admin-login";

const INVALID = { error: "Username atau kata sandi tidak valid." };

/** admin_users.username → Supabase Auth email, read with the service role before sign-in. */
async function emailForUsername(username: string): Promise<string | null> {
  try {
    const db = academyBillingClient();
    const { data: admin } = await db.from("admin_users").select("user_id").eq("username", username).maybeSingle();
    if (!admin) return null;
    const { data } = await db.auth.admin.getUserById(admin.user_id);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

export async function loginAdmin(identifier: string, password: string) {
  const credentials = parseAdminCredentials({ identifier, password });
  if (!credentials) return INVALID;
  const name = credentials.identifier;
  // Email passes through; a username is looked up in admin_users, with the env pair as a fallback.
  const email = name.includes("@")
    ? name
    : (await emailForUsername(name)) ?? resolveAdminEmail(name, { username: process.env.SUPABASE_ADMIN_USERNAME, email: process.env.SUPABASE_ADMIN_EMAIL });
  if (!email) return INVALID;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return INVALID;
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Akun tidak memiliki akses CMS." };
  }
  return { error: null };
}
