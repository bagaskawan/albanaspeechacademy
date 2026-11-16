import Link from "next/link";
import { requireAdminMember } from "@/lib/server/admin-guard";
import ProfilAkademiPage from "../profil-akademi/page";
import KontakPage from "../kontak/page";
import RekeningPage from "../rekening/page";

export const dynamic = "force-dynamic";

// One settings screen (account menu → Pengaturan); each tab renders the existing module page and its guard.
const tabs = [
  { id: "profil", label: "Profil akademi", Panel: ProfilAkademiPage },
  { id: "kontak", label: "Kontak", Panel: KontakPage },
  { id: "rekening", label: "Rekening", Panel: RekeningPage },
] as const;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdminMember();
  const { tab } = await searchParams;
  const active = tabs.find((item) => item.id === tab) ?? tabs[0];
  const { Panel } = active;

  return <div className="space-y-6">
    <nav aria-label="Bagian pengaturan" className="inline-flex flex-wrap gap-1 rounded-full bg-admin-surface p-1.5">
      {tabs.map((item) => <Link
        key={item.id}
        href={item.id === "profil" ? "/admin/settings" : `/admin/settings?tab=${item.id}`}
        scroll={false}
        aria-current={item.id === active.id ? "page" : undefined}
        className={`inline-flex h-11 items-center rounded-full px-5 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink ${item.id === active.id ? "bg-admin-ink font-medium text-admin-on-ink" : "text-admin-text-secondary hover:text-admin-ink"}`}
      >{item.label}</Link>)}
    </nav>
    <Panel />
  </div>;
}
