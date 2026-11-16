"use server";

import { createClient } from "@/lib/supabase/server";

export async function loginAdmin(identifier: string, password: string) {
  const name = identifier.trim().toLowerCase();
  const username = process.env.SUPABASE_ADMIN_USERNAME?.trim().toLowerCase();
  const email = name.includes("@") ? name : name === username ? process.env.SUPABASE_ADMIN_EMAIL : null;
  if (!email || !password) return { error: "Email atau kata sandi tidak valid." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Email atau kata sandi tidak valid." };
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Akun tidak memiliki akses CMS." };
  }
  return { error: null };
}
