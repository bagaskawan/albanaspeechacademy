"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { MoveRight } from "lucide-react";
import type { AdminNavGroup, AdminNavModule } from "@/lib/admin-nav";
import { ease, transition } from "@/lib/motion/tokens";

const ACTIONS_ID = "admin-page-actions";

/** Shell-level header (admin-ui-patterns §3.3): breadcrumb Grup ⟶ Modul, title, round-button slot. */
export function PageHeader({ group, module, pathname }: { group: AdminNavGroup; module?: AdminNavModule; pathname: string }) {
  const title = module?.label ?? group.label;
  return <div className="order-1 mb-8 flex flex-wrap items-end justify-between gap-4 lg:col-start-2 lg:row-start-1">
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        className="min-w-0"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: ease.out } }}
        exit={{ opacity: 0, transition: transition.exit }}
      >
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-[14px] leading-[1.4] text-admin-text-secondary">
            <li><Link href={group.href} className="hover:text-admin-ink">{group.label}</Link></li>
            {module && <>
              <li aria-hidden="true"><MoveRight size={16} strokeWidth={1.5} /></li>
              <li><Link href={module.href} aria-current="page" className="hover:text-admin-ink">{module.label}</Link></li>
            </>}
          </ol>
        </nav>
        <h1 className="mt-2 text-[32px] font-normal leading-[1.1] tracking-[-0.02em] md:text-[44px]">{title}</h1>
      </m.div>
    </AnimatePresence>
    <div id={ACTIONS_ID} className="flex items-center gap-3 empty:hidden" />
  </div>;
}

/** Modules render their Saring · Cari · Aksi utama buttons through this into the header slot. */
export function AdminPageActions({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById(ACTIONS_ID)), []);
  return target ? createPortal(children, target) : null;
}
