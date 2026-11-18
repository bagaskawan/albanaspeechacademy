import { requireAdminMember } from "@/lib/server/admin-guard";
import type { AcademyLegality } from "./legality-actions";
import { LegalityClient } from "./LegalityClient";

function normalizeLegality(raw: unknown): AcademyLegality {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const str = (key: keyof AcademyLegality) => (typeof obj[key] === "string" ? obj[key] : "");
  return {
    akta_url: str("akta_url"),
    nib_url: str("nib_url"),
    skt_url: str("skt_url"),
    npwp_front_url: str("npwp_front_url"),
    npwp_back_url: str("npwp_back_url"),
  };
}

export async function LegalityPanel() {
  const supabase = await requireAdminMember();
  const { data, error } = await supabase
    .from("academy")
    .select("legality")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error("Gagal memuat legalitas akademi: " + error.message);
  }

  return <LegalityClient initialLegality={normalizeLegality(data?.legality)} />;
}
