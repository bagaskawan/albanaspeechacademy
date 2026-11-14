import React from "react";
import { requireAdminMember } from "@/lib/server/admin-guard";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Admin Settings - Panggung Kreator",
  description: "Pengaturan sistem dan notifikasi admin",
};

export default async function SettingsPage() {
  const supabase = await requireAdminMember();
  const { data } = await supabase
    .from("contact_channels")
    .select("kind, value")
    .order("kind", { ascending: true });

  return <SettingsClient initialContacts={data ?? []} />;
}
