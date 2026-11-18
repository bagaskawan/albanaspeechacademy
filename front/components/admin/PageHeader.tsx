"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { ArrowLeft } from "lucide-react";
import type { AdminNavGroup, AdminNavModule } from "@/lib/admin-nav";
import { ease } from "@/lib/motion/tokens";

const ACTIONS_ID = "admin-page-actions";
const TITLE_ID = "admin-page-title";
const noopSubscribe = () => () => { };

/** Shell-level header (admin-ui-patterns §3.3): breadcrumb Grup ⟶ Modul, title, round-button slot. */
export function PageHeader({ group, module, isDetail, pathname }: { group: AdminNavGroup; module?: AdminNavModule; isDetail: boolean; pathname: string }) {
  const title = module?.label ?? group.label;
  const description = module?.description ?? group.description;
  return <div className="mb-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      {/* Keyed remount fades the new title in at once; no exit wait between modules. */}
      <m.div
        key={pathname}
        className="flex min-w-0 items-center gap-3.5"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.16, ease: ease.out } }}
      >
        {isDetail && module && <Link
          href={module.href}
          aria-label={`Kembali ke ${module.label}`}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-admin-line-strong bg-admin-canvas text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
        ><ArrowLeft aria-hidden="true" size={18} strokeWidth={1.5} /></Link>}
        <div className="min-w-0">
          {isDetail && module ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary">
                [ {module.label} ]
              </p>
              <h1 className="mt-1 text-[24px] md:text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-admin-ink">
                <span id={TITLE_ID} className="peer empty:hidden" />
                <span className="peer-[:not(:empty)]:hidden">{title}</span>
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-[20px] font-bold leading-[1.2] tracking-[-0.02em] sm:text-[24px] md:text-[28px]">{title}</h1>
              {description && <p className="mt-1 max-w-[60ch] text-[13px] leading-[1.5] text-admin-text-secondary sm:text-[14px]">{description}</p>}
            </>
          )}
        </div>
      </m.div>
      <div id={ACTIONS_ID} className="flex items-center gap-3 empty:hidden max-md:w-full" />
    </div>
    <hr className="mt-6 border-admin-line" />
  </div>;
}

/** The slot AdminPageActions portals into; pages with their own header (settings) render it themselves. */
export function PageActionsSlot({ className = "flex items-center gap-3 empty:hidden" }: { className?: string }) {
  return <div id={ACTIONS_ID} className={className} />;
}

/** Modules render their Saring · Cari · Aksi utama buttons through this into the header slot. */
export function AdminPageActions({ children }: { children: React.ReactNode }) {
  const target = useSyncExternalStore(noopSubscribe, () => document.getElementById(ACTIONS_ID), () => null);
  return target ? createPortal(children, target) : null;
}

const pageActionClass = "inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-admin-ink px-5 text-[15px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink disabled:opacity-60 max-md:size-12 max-md:justify-center max-md:px-0";

/** Primary page action (§3.2): black labelled pill in the header; a round icon button below 768 px. */
export function PageAction({ href, onClick, icon, children }: { href?: string; onClick?: () => void; icon: React.ReactNode; children: string }) {
  const content = <>{icon}<span className="max-md:sr-only">{children}</span></>;
  return <AdminPageActions>
    {href
      ? <Link href={href} className={pageActionClass}>{content}</Link>
      : <button type="button" onClick={onClick} className={pageActionClass}>{content}</button>}
  </AdminPageActions>;
}

/** Detail pages name themselves in the breadcrumb (Grup ⟶ Modul ⟶ judul); falls back to "Detail". */
export function AdminPageTitle({ children }: { children: React.ReactNode }) {
  const target = useSyncExternalStore(noopSubscribe, () => document.getElementById(TITLE_ID), () => null);
  return target ? createPortal(children, target) : null;
}
