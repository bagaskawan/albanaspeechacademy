import { requireAdminMember } from "@/lib/server/admin-guard";
import KontakClient, { ContactRow } from "./KontakClient";

export default async function KontakPanel() {
  const supabase = await requireAdminMember();

  const { data, error } = await supabase
    .from("contact_channels")
    .select("kind, value")
    .order("kind", { ascending: true });

  if (error) {
    throw new Error("Gagal memuat kontak: " + error.message);
  }

  return <KontakClient initialContacts={(data || []) as ContactRow[]} />;
}
