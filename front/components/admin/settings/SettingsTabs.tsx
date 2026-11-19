"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowLeft, Loader2, RotateCcw, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { PageActionsSlot } from "@/components/admin/PageHeader";
import { ease, transition } from "@/lib/motion/tokens";
import { SettingsFormsContext, type SettingsFormEntry } from "./settings-forms";

export type SettingsTab = { id: string; label: string; hint: string; icon: React.ReactNode };

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";

/** Client tabs (no navigation), one shared save for every changed form, and a floating unsaved-changes bar. */
export function SettingsTabs({ tabs, panels, initialTab }: { tabs: SettingsTab[]; panels: Record<string, React.ReactNode>; initialTab: string }) {
  const [activeId, setActiveId] = useState(tabs.some((tab) => tab.id === initialTab) ? initialTab : tabs[0].id);
  const [entries, setEntries] = useState<Record<string, SettingsFormEntry>>({});
  const [saving, setSaving] = useState(false);

  const set = useCallback((id: string, entry: SettingsFormEntry | null) => {
    setEntries((previous) => {
      const next = { ...previous };
      if (entry) next[id] = entry; else delete next[id];
      return next;
    });
  }, []);
  const registry = useMemo(() => ({ set }), [set]);

  const dirtyIds = Object.keys(entries).filter((id) => entries[id].dirty);
  const dirty = dirtyIds.length > 0;
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  function select(id: string) {
    setActiveId(id);
    // Keep the tab bookmarkable without a navigation.
    window.history.replaceState(null, "", id === tabs[0].id ? "/admin/settings" : `/admin/settings?tab=${id}`);
  }

  async function saveAll() {
    setSaving(true);
    const results = await Promise.all(dirtyIds.map((id) => entries[id].save()));
    setSaving(false);
    if (results.every(Boolean)) toast.success("Perubahan disimpan.");
    else toast.error("Sebagian perubahan gagal disimpan. Periksa pesan di formulir.");
  }

  function discardAll() {
    for (const id of dirtyIds) entries[id].reset();
  }

  return <SettingsFormsContext.Provider value={registry}>
    <div className="mx-auto max-w-[1200px] pb-28 lg:flex lg:h-[calc(100dvh-72px-4.5rem)] lg:flex-col lg:pb-0">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-admin-line pb-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/admin" aria-label="Kembali ke dashboard" title="Kembali ke dashboard"
            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-admin-line-strong text-admin-ink transition-colors hover:bg-admin-surface ${focusRing}`}>
            <ArrowLeft aria-hidden="true" size={20} strokeWidth={1.5} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] sm:text-[28px] md:text-[32px]">Pengaturan</h1>
            <p className="mt-1 text-[14px] text-admin-text-secondary md:text-[15px]">Kanal kontak, rekening pembayaran, program, dan legalitas.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Module actions (e.g. Tambah rekening) belong to their tab only. */}
          <div className={activeId === "rekening" ? "" : "hidden"}><PageActionsSlot /></div>
          <button type="button" onClick={() => void saveAll()} disabled={!dirty || saving}
            className={`inline-flex h-12 items-center gap-2 rounded-full bg-admin-ink px-5 text-[15px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft max-md:hidden disabled:cursor-not-allowed disabled:bg-admin-surface-muted disabled:text-admin-text-secondary ${focusRing}`}>
            {saving ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Save aria-hidden="true" size={18} strokeWidth={1.5} />}
            Simpan perubahan
          </button>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-10">
        <div role="tablist" aria-label="Bagian pengaturan" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:self-start lg:overflow-visible lg:pb-0">
          {tabs.map((tab) => {
            const current = tab.id === active.id;
            return <button
              key={tab.id}
              type="button"
              role="tab"
              id={`settings-tab-${tab.id}`}
              aria-selected={current}
              aria-controls={`settings-panel-${tab.id}`}
              onClick={() => select(tab.id)}
              className={`flex min-w-[220px] items-center gap-3 rounded-[20px] p-3 text-left transition-colors lg:min-w-0 ${focusRing} ${current ? "bg-admin-canvas shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-admin-line" : "hover:bg-admin-surface"}`}
            >
              <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${current ? "bg-admin-ink text-admin-on-ink" : "text-admin-text-secondary"}`}>{tab.icon}</span>
              <span className="min-w-0">
                <span className={`flex items-center gap-2 truncate text-[15px] text-admin-ink ${current ? "font-semibold" : "font-medium"}`}>
                  {tab.label}
                  {entries[tab.id]?.dirty && <span className="size-2 shrink-0 rounded-full bg-admin-peach-dot" aria-label="ada perubahan belum disimpan" />}
                </span>
                <span className="block truncate text-[13px] text-admin-text-secondary">{tab.hint}</span>
              </span>
            </button>;
          })}
        </div>

        {/* All panels stay mounted so unsaved edits survive tab switches; only the active one is shown. */}
        {tabs.map((tab) => <section
          key={tab.id}
          role="tabpanel"
          id={`settings-panel-${tab.id}`}
          aria-labelledby={`settings-tab-${tab.id}`}
          hidden={tab.id !== active.id}
          className="min-w-0 rounded-[var(--admin-radius-card)] bg-admin-canvas p-[var(--admin-space-card)] ring-1 ring-admin-line lg:col-start-2 lg:row-start-1 lg:flex lg:min-h-0 lg:flex-col lg:pb-0"
        >
          <div className="mb-6 flex shrink-0 items-center gap-4 border-b border-admin-line pb-6">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-admin-line-strong">{tab.icon}</span>
            <div className="min-w-0">
              <h2 className="text-[18px] font-semibold md:text-[20px]">{tab.label}</h2>
              <p className="text-[14px] text-admin-text-secondary">{tab.hint}</p>
            </div>
          </div>
          {/* The only scrolling area on wide screens; bottom padding clears the floating save bar. */}
          <div className="lg:-mx-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-2 lg:pb-28">{panels[tab.id]}</div>
        </section>)}
      </div>

      <AnimatePresence>
        {dirty && <m.div
          role="status"
          className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
          initial={{ y: "150%", opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { duration: 0.28, ease: ease.out } }}
          exit={{ y: "150%", opacity: 0, transition: transition.exit }}
        >
          <div className="flex w-full max-w-[560px] flex-wrap items-center gap-3 rounded-full bg-[#0b0b0b] py-2 pl-3 pr-2 text-white shadow-[var(--admin-shadow-overlay)] max-sm:rounded-[24px]">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-admin-peach-dot/20 text-admin-peach-dot"><TriangleAlert aria-hidden="true" size={18} strokeWidth={1.5} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">Perubahan belum disimpan</span>
              <span className="block truncate text-[12px] text-white/60">Simpan agar perubahan berlaku di situs.</span>
            </span>
            <button type="button" onClick={discardAll} disabled={saving} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50">
              <RotateCcw aria-hidden="true" size={16} strokeWidth={1.5} /> Buang
            </button>
            <button type="button" onClick={() => void saveAll()} disabled={saving} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[14px] font-medium text-[#0b0b0b] transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60">
              {saving ? <Loader2 aria-hidden="true" size={16} className="animate-spin" /> : <Save aria-hidden="true" size={16} strokeWidth={1.5} />} Simpan perubahan
            </button>
          </div>
        </m.div>}
      </AnimatePresence>
    </div>
  </SettingsFormsContext.Provider>;
}
