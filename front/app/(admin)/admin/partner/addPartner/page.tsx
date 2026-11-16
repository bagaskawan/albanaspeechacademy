import React from "react";
import { createClient } from "@/lib/supabase/server";
import AddPartnerClient from "./AddPartnerClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AddPartnerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = params.id;
  const supabase = await createClient();

  let initialPartner = null;
  if (id) {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("id", id)
      .single();
    if (data && !error) {
      initialPartner = data;
    }
  }

  // Fetch daftar venue dari tabel venues (menggunakan select('*') agar kompatibel jika kolom use_count belum termigrasi)
  const { data: venuesData, error: venuesError } = await supabase
    .from("venues")
    .select("*")
    .order("name", { ascending: true });

  if (venuesError) {
    console.error("Gagal mengambil data venues di addPartner:", venuesError);
  }

  const venues = (venuesData || []).map((v: any) => ({
    id: v.id,
    name: v.name,
    address: v.address || "",
    city: v.city || "",
    use_count: v.use_count || 0,
  }));

  return <AddPartnerClient initialPartner={initialPartner} venues={venues} />;
}
