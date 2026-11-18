import { BookOpen, Building2, FileCheck2, GraduationCap, Landmark, Phone } from "lucide-react";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import { requireAdminMember } from "@/lib/server/admin-guard";
import ProfilAkademiPanel from "../profil-akademi/panel";
import KontakPanel from "../kontak/panel";
import RekeningPanel from "../rekening/panel";
import { InhouseTrainingProgramPanel, PublicTrainingProgramPanel } from "./program-panel";
import { LegalityPanel } from "./legality-panel";

export const dynamic = "force-dynamic";

// Focused settings screen (account menu → Pengaturan): no sidebar, client-side tabs, one shared save.
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdminMember();
  const { tab } = await searchParams;
  const icon = { "aria-hidden": true, size: 18, strokeWidth: 1.5 } as const;

  return (
    <SettingsTabs
      initialTab={tab ?? "profil"}
      tabs={[
        { id: "profil", label: "Profil akademi", hint: "Nama, metode belajar, penjadwalan ulang", icon: <Building2 {...icon} /> },
        { id: "kontak", label: "Kontak", hint: "Kanal kontak di situs publik", icon: <Phone {...icon} /> },
        { id: "rekening", label: "Rekening", hint: "Rekening tujuan transfer tagihan", icon: <Landmark {...icon} /> },
        { id: "public-training", label: "Public Training", hint: "Detail, biaya, dan materi Public Training", icon: <BookOpen {...icon} /> },
        { id: "inhouse-training", label: "In House Training", hint: "Detail, dokumentasi, dan materi In House", icon: <GraduationCap {...icon} /> },
        { id: "legalitas", label: "Legalitas", hint: "Akta CV, NIB, SKT, dan kartu NPWP", icon: <FileCheck2 {...icon} /> },
      ]}
      panels={{
        profil: <ProfilAkademiPanel />,
        kontak: <KontakPanel />,
        rekening: <RekeningPanel />,
        "public-training": <PublicTrainingProgramPanel />,
        "inhouse-training": <InhouseTrainingProgramPanel />,
        legalitas: <LegalityPanel />,
      }}
    />
  );
}
