import React from "react";
import { requireAdminMember } from "@/lib/server/admin-guard";
import PendaftarClient from "./PendaftarClient";

export const dynamic = "force-dynamic";

export default async function PendaftarPage() {
  const supabase = await requireAdminMember();
  const { data, error } = await supabase
    .from("registrations")
    .select("*, batches!inner(title, program_slug, programs!inner(title))")
    .order("received_at", { ascending: false });

  if (error) console.error("Gagal memuat pendaftar:", error);

  return <PendaftarClient initialRows={data ?? []} />;
}
