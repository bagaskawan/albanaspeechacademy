import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { ProgramBatchBoard, type BoardBundle } from "@/components/admin/program/ProgramBatchBoard";
import { BUNDLE_SLUG } from "@/lib/bundle";

export const dynamic = "force-dynamic";

// Jam permintaan ikut dibaca di sini, bukan saat render, supaya status batch
// (Dibuka / Ditutup / Selesai) tetap sama antara server dan klien.
async function loadBoard() {
  const supabase = await requireAdminMember();
  const [{ data: programs }, { data: batches }, { data: bundle }] = await Promise.all([
    supabase.from("programs").select("slug,title,price_idr,original_price_idr,dp_percent,form_kind").order("title"),
    supabase.from("batches").select("slug,program_slug,title,registration_open,sessions").order("slug"),
    academyBillingClient().from("bundle_offers").select("active,price_idr,dp_percent,description").eq("slug", BUNDLE_SLUG).maybeSingle(),
  ]);
  return {
    programs: programs ?? [],
    batches: batches ?? [],
    bundle: (bundle as BoardBundle | null) ?? null,
    nowMs: Date.now(),
  };
}

// Daftar program tetap: tidak ada cari, ekspor, atau tambah program.
export default async function ProgramPage() {
  const board = await loadBoard();
  return <ProgramBatchBoard {...board} />;
}
