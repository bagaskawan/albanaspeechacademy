import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Construction } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminMember } = await supabase
    .from("members")
    .select("id, full_name, stage_name, role")
    .eq("id", user.id)
    .single();

  if (!adminMember || adminMember.role !== "admin") {
    redirect("/myprofile");
  }

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-8 text-center text-text-muted">
      <Construction size={96} strokeWidth={1.5} aria-hidden="true" />
      <p className="text-xl md:text-md font-black text-text-muted uppercase tracking-[0.15em]">
        Under construction
      </p>
    </div>
  );
}
