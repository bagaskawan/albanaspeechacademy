import { Building2, Landmark, Phone } from "lucide-react";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import { requireAdminMember } from "@/lib/server/admin-guard";
import ProfilAkademiPage from "../profil-akademi/page";
import KontakPage from "../kontak/page";
import RekeningPage from "../rekening/page";

export const dynamic = "force-dynamic";

// Focused settings screen (account menu → Pengaturan): no sidebar, client-side tabs, one shared save.
// Each panel is the existing module page, so its guard, data loading and forms stay in one place.
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdminMember();
  const { tab } = await searchParams;
  const icon = { "aria-hidden": true, size: 18, strokeWidth: 1.5 } as const;

  return <SettingsTabs
    initialTab={tab ?? "profil"}
    tabs={[
      { id: "profil", label: "Profil akademi", hint: "Nama, metode belajar, penjadwalan ulang", icon: <Building2 {...icon} /> },
      { id: "kontak", label: "Kontak", hint: "Kanal kontak di situs publik", icon: <Phone {...icon} /> },
      { id: "rekening", label: "Rekening", hint: "Rekening tujuan transfer tagihan", icon: <Landmark {...icon} /> },
    ]}
    panels={{ profil: <ProfilAkademiPage />, kontak: <KontakPage />, rekening: <RekeningPage /> }}
  />;
}
