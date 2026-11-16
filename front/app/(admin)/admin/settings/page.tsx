import Link from "next/link";
import { Building2, House, Landmark, Phone, type LucideIcon } from "lucide-react";
import { PageActionsSlot } from "@/components/admin/PageHeader";
import { requireAdminMember } from "@/lib/server/admin-guard";
import ProfilAkademiPage from "../profil-akademi/page";
import KontakPage from "../kontak/page";
import RekeningPage from "../rekening/page";

export const dynamic = "force-dynamic";

// Focused settings screen (account menu → Pengaturan): no sidebar, own header with a home button,
// vertical sections on the left, the existing module page (with its guard and forms) on the right.
const tabs: { id: string; label: string; hint: string; icon: LucideIcon; Panel: () => Promise<React.ReactNode> }[] = [
  { id: "profil", label: "Profil akademi", hint: "Nama, metode belajar, penjadwalan ulang", icon: Building2, Panel: ProfilAkademiPage },
  { id: "kontak", label: "Kontak", hint: "Kanal kontak di situs publik", icon: Phone, Panel: KontakPage },
  { id: "rekening", label: "Rekening", hint: "Rekening tujuan transfer tagihan", icon: Landmark, Panel: RekeningPage },
];

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdminMember();
  const { tab } = await searchParams;
  const active = tabs.find((item) => item.id === tab) ?? tabs[0];
  const { Panel, icon: ActiveIcon } = active;

  return <div className="mx-auto max-w-[1200px]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-admin-line pb-8">
      <div className="flex min-w-0 items-center gap-4">
        <Link href="/admin" className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-admin-line-strong px-4 text-[14px] font-medium text-admin-ink transition-colors hover:bg-admin-surface ${focusRing}`}>
          <House aria-hidden="true" size={18} strokeWidth={1.5} />
          <span>Dashboard</span>
        </Link>
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">Pengaturan</h1>
          <p className="mt-1 text-[15px] text-admin-text-secondary">Profil akademi, kanal kontak, dan rekening pembayaran.</p>
        </div>
      </div>
      <PageActionsSlot />
    </header>

    <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
      <nav aria-label="Bagian pengaturan" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {tabs.map((item) => {
          const current = item.id === active.id;
          const Icon = item.icon;
          return <Link
            key={item.id}
            href={item.id === "profil" ? "/admin/settings" : `/admin/settings?tab=${item.id}`}
            scroll={false}
            aria-current={current ? "page" : undefined}
            className={`flex min-w-[220px] items-center gap-3 rounded-[20px] p-3 transition-colors lg:min-w-0 ${focusRing} ${current ? "bg-admin-canvas shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-admin-line" : "hover:bg-admin-surface"}`}
          >
            <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${current ? "bg-admin-ink text-admin-on-ink" : "text-admin-text-secondary"}`}>
              <Icon aria-hidden="true" size={18} strokeWidth={1.5} />
            </span>
            <span className="min-w-0">
              <span className={`block truncate text-[15px] ${current ? "font-semibold text-admin-ink" : "font-medium text-admin-ink"}`}>{item.label}</span>
              <span className="block truncate text-[13px] text-admin-text-secondary">{item.hint}</span>
            </span>
          </Link>;
        })}
      </nav>

      <section aria-labelledby="settings-section-title" className="min-w-0 rounded-[var(--admin-radius-card)] bg-admin-canvas p-[var(--admin-space-card)] ring-1 ring-admin-line">
        <div className="mb-6 flex items-center gap-4 border-b border-admin-line pb-6">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-admin-line-strong">
            <ActiveIcon aria-hidden="true" size={20} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <h2 id="settings-section-title" className="text-[20px] font-semibold">{active.label}</h2>
            <p className="text-[14px] text-admin-text-secondary">{active.hint}</p>
          </div>
        </div>
        <Panel />
      </section>
    </div>
  </div>;
}
