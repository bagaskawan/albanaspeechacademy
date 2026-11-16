import { requireAdminMember } from "@/lib/server/admin-guard";
import ProfilAkademiClient, { AcademyProfile } from "./ProfilAkademiClient";

export const dynamic = "force-dynamic";

export default async function ProfilAkademiPage() {
  const supabase = await requireAdminMember();

  const { data, error } = await supabase
    .from("academy")
    .select("id, name, teaching_method, reschedule_policy")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error("Gagal memuat profil akademi: " + error.message);
  }

  return <ProfilAkademiClient initialProfile={data as AcademyProfile} />;
}
