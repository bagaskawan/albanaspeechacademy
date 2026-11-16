"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { ArrowLeft, MoveRight } from "lucide-react";
import type { AdminNavGroup, AdminNavModule } from "@/lib/admin-nav";
import { ease } from "@/lib/motion/tokens";

const ACTIONS_ID = "admin-page-actions";
const TITLE_ID = "admin-page-title";
const noopSubscribe = () => () => {};

/** Shell-level header (admin-ui-patterns §3.3): breadcrumb Grup ⟶ Modul, title, round-button slot. */
export function PageHeader({ group, module, isDetail, pathname }: { group: AdminNavGroup; module?: AdminNavModule; isDetail: boolean; pathname: string }) {
  const title = module?.label ?? group.label;
  return <div className="order-1 mb-8 flex flex-wrap items-end justify-between gap-4 lg:col-start-2 lg:row-start-1">
    {/* Keyed remount fades the new title in at once; no exit wait between modules. */}
    <m.div
        key={pathname}
        className="flex min-w-0 items-end gap-4"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.16, ease: ease.out } }}
      >
        {isDetail && module && <Link
          href={module.href}
          aria-label={`Kembali ke ${module.label}`}
          className="mb-1 inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-admin-surface text-admin-ink transition-colors hover:bg-admin-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
        ><ArrowLeft aria-hidden="true" size={22} strokeWidth={1.5} /></Link>}
        <div className="min-w-0">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-[14px] leading-[1.4] text-admin-text-secondary">
            <li><Link href={group.href} className="hover:text-admin-ink">{group.label}</Link></li>
            {module && <>
              <li aria-hidden="true"><MoveRight size={16} strokeWidth={1.5} /></li>
              <li><Link href={module.href} aria-current={isDetail ? undefined : "page"} className="hover:text-admin-ink">{module.label}</Link></li>
            </>}
            {isDetail && <>
              <li aria-hidden="true"><MoveRight size={16} strokeWidth={1.5} /></li>
              <li aria-current="page" className="truncate"><span id={TITLE_ID} data-fallback="Detail" className="empty:before:content-[attr(data-fallback)]" /></li>
            </>}
          </ol>
        </nav>
        <h1 className="mt-2 text-[32px] font-normal leading-[1.1] tracking-[-0.02em] md:text-[44px]">{title}</h1>
        </div>
      </m.div>
    <div id={ACTIONS_ID} className="flex items-center gap-3 empty:hidden" />
  </div>;
}

/** Modules render their Saring · Cari · Aksi utama buttons through this into the header slot. */
export function AdminPageActions({ children }: { children: React.ReactNode }) {
  const target = useSyncExternalStore(noopSubscribe, () => document.getElementById(ACTIONS_ID), () => null);
  return target ? createPortal(children, target) : null;
}

/** Detail pages name themselves in the breadcrumb (Grup ⟶ Modul ⟶ judul); falls back to "Detail". */
export function AdminPageTitle({ children }: { children: React.ReactNode }) {
  const target = useSyncExternalStore(noopSubscribe, () => document.getElementById(TITLE_ID), () => null);
  return target ? createPortal(children, target) : null;
}
