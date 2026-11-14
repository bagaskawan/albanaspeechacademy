import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Server-side guard for admin pages: requires a logged-in member with role "admin". */
export async function requireAdminMember() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!member || member.role !== "admin") redirect("/myprofile");

  return supabase;
}
