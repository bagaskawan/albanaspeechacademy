"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatePresence, m, stagger, useMotionValueEvent, useScroll } from "motion/react";
import { Dialog } from "radix-ui";
import {
  ArrowLeft, BookOpen, Building2, CalendarRange, Film, Handshake, Images, Landmark, LayoutDashboard,
  LogOut, Menu, Newspaper, Phone, Quote, ReceiptText, UserRound, Users, type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { adminNavGroups, resolveAdminNav, type AdminNavGroup, type AdminNavIcon } from "@/lib/admin-nav";
import { duration, ease, spring, transition } from "@/lib/motion/tokens";
import { createClient } from "@/lib/supabase/client";

const icons: Record<AdminNavIcon, LucideIcon> = {
  dashboard: LayoutDashboard, users: Users, receipt: ReceiptText, book: BookOpen, calendar: CalendarRange,
  trainer: UserRound, article: Newspaper, media: Film, gallery: Images, quote: Quote, partner: Handshake,
  academy: Building2, contact: Phone, bank: Landmark,
};

const roundButton = "inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-admin-surface text-admin-ink transition-colors duration-[var(--dur-hover)] hover:bg-admin-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";

type ShellProps = { children: React.ReactNode; pendingInvoices: number; email: string | null };

export function AdminShell({ children, pendingInvoices, email }: ShellProps) {
  const pathname = usePathname();
  const nav = resolveAdminNav(pathname);
  const hidden = useTopbarHidden();
  const [sheetOpen, setSheetOpen] = useState(false);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/login");
  }

  return <TooltipProvider delayDuration={200}>
    <div className="mx-auto min-h-screen max-w-[1600px] px-[var(--admin-gutter)] text-admin-ink">
      <m.header
        className="sticky top-0 z-40 -mx-[var(--admin-gutter)] flex h-24 items-center gap-3 bg-admin-canvas px-[var(--admin-gutter)]"
        animate={{ y: hidden.value ? "-100%" : 0 }}
        transition={{ duration: 0.24, ease: ease.out }}
        onFocusCapture={hidden.reveal}
      >
        <Link href="/admin" aria-label="Albana CMS, ke Dashboard" className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-[#0b0b0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink">
          <Image src="/images/Albana-Speech-Academy-Logo-White.png" alt="" width={32} height={32} className="size-8 object-contain" priority />
        </Link>

        <nav aria-label="Grup CMS" className="hidden min-w-0 flex-1 md:block">
          <GroupPills activeId={nav.group.id} pendingInvoices={pendingInvoices} />
        </nav>

        <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
          <Dialog.Trigger className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-full bg-admin-surface px-5 text-left text-[15px] md:hidden">
            <Menu aria-hidden="true" size={18} strokeWidth={1.5} />
            <span className="truncate font-medium">{nav.group.label}</span>
            {pendingInvoices > 0 && <Badge count={pendingInvoices} />}
          </Dialog.Trigger>
          <AnimatePresence>
            {sheetOpen && <Dialog.Portal forceMount key="group-sheet">
              <Dialog.Overlay asChild forceMount>
                <m.div className="fixed inset-0 z-50 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: transition.exit }} />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount aria-describedby={undefined}>
                <m.div
                  className="fixed inset-x-0 bottom-0 z-50 rounded-t-[var(--admin-radius-card)] bg-admin-canvas p-5 pb-8 shadow-[var(--admin-shadow-overlay)]"
                  initial={{ y: "100%" }} animate={{ y: 0, transition: transition.overlay }} exit={{ y: "100%", transition: transition.exit }}
                >
                  <Dialog.Title className="mb-4 text-[15px] font-semibold">Pilih grup</Dialog.Title>
                  <nav aria-label="Grup CMS">
                    <GroupPills activeId={nav.group.id} pendingInvoices={pendingInvoices} vertical onNavigate={() => setSheetOpen(false)} />
                  </nav>
                </m.div>
              </Dialog.Content>
            </Dialog.Portal>}
          </AnimatePresence>
        </Dialog.Root>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <ThemeToggle className={roundButton} />
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Menu akun" className={roundButton}>
              <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-admin-ink text-[15px] font-medium uppercase text-admin-on-ink">{email?.[0] ?? "A"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56 rounded-[20px] border-admin-line bg-admin-surface p-2 shadow-[var(--admin-shadow-pop)]">
              {email && <><DropdownMenuLabel className="truncate text-[13px] font-normal text-admin-text-secondary">{email}</DropdownMenuLabel><DropdownMenuSeparator /></>}
              <DropdownMenuItem onSelect={signOut}><LogOut aria-hidden="true" size={16} strokeWidth={1.5} /> Keluar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </m.header>

      <div className="grid grid-cols-1 gap-x-8 pb-10 lg:grid-cols-[56px_minmax(0,1fr)]">
        <Rail group={nav.group} activeHref={nav.module?.href ?? (pathname === "/admin" ? "/admin" : undefined)} />
        <main id="admin-main" className="order-3 min-w-0 lg:col-start-2 lg:row-start-2">{children}</main>
      </div>
    </div>
  </TooltipProvider>;
}

function GroupPills({ activeId, pendingInvoices, vertical = false, onNavigate }: {
  activeId: AdminNavGroup["id"]; pendingInvoices: number; vertical?: boolean; onNavigate?: () => void;
}) {
  return <ul className={vertical ? "grid gap-3" : "flex items-center gap-3 overflow-x-auto"}>
    {adminNavGroups.map((group) => {
      const active = group.id === activeId;
      const Icon = icons[group.icon];
      return <li key={group.id} className="shrink-0">
        <Link
          href={group.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={`relative flex h-14 items-center gap-2.5 rounded-full px-5 text-[15px] leading-none xl:px-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink ${active ? "font-medium text-admin-on-ink" : "bg-admin-surface text-admin-ink hover:bg-admin-surface-muted"}`}
        >
          {active && <m.span layoutId={vertical ? "admin-pill-sheet" : "admin-pill"} className="absolute inset-0 rounded-full bg-admin-ink" transition={transition.pill} />}
          <Icon aria-hidden="true" size={18} strokeWidth={1.5} className="relative" />
          <span className={`relative ${active || vertical ? "" : "max-lg:sr-only"}`}>{group.label}</span>
          {group.id === "pendaftaran" && pendingInvoices > 0 && <Badge count={pendingInvoices} />}
        </Link>
      </li>;
    })}
  </ul>;
}

function Badge({ count }: { count: number }) {
  return <span className="relative -mr-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-admin-accent px-1.5 text-[12px] font-medium text-admin-accent-ink">
    <span aria-hidden="true">{count > 99 ? "99+" : count}</span>
    <span className="sr-only">, {count} tagihan menunggu verifikasi</span>
  </span>;
}

const railList = { show: { transition: { delayChildren: stagger(0.04) } }, hide: {} };
const railItem = {
  hide: { opacity: 0, scale: 0.8, transition: { duration: duration.hover } },
  show: { opacity: 1, scale: 1, transition: spring },
};

function Rail({ group, activeHref }: { group: AdminNavGroup; activeHref?: string }) {
  const router = useRouter();
  const items = group.shortcuts ?? group.modules;
  return <nav aria-label={`Modul ${group.label}`} className="order-2 mb-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mb-0">
    <div className="relative flex gap-3 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible lg:pb-0">
      <RailButton label="Kembali" onClick={() => router.back()}><ArrowLeft aria-hidden="true" size={22} strokeWidth={1.5} /></RailButton>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.ul key={group.id} className="flex gap-3 lg:flex-col" variants={railList} initial="hide" animate="show" exit="hide">
          {items.map((item) => {
            const Icon = icons[item.icon];
            const active = item.href === activeHref;
            return <m.li key={item.href} variants={railItem}>
              <RailButton label={item.label} href={item.href} active={active}><Icon aria-hidden="true" size={22} strokeWidth={1.5} /></RailButton>
            </m.li>;
          })}
        </m.ul>
      </AnimatePresence>
    </div>
  </nav>;
}

function RailButton({ label, href, active = false, onClick, children }: {
  label: string; href?: string; active?: boolean; onClick?: () => void; children: React.ReactNode;
}) {
  const className = `${roundButton} ${active ? "!bg-admin-ink !text-admin-on-ink" : ""}`;
  return <Tooltip>
    <TooltipTrigger asChild>
      <m.span className="inline-flex rounded-full" whileTap={{ scale: 0.92 }} transition={spring}>
        {href
          ? <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className={className}>{children}</Link>
          : <button type="button" aria-label={label} onClick={onClick} className={className}>{children}</button>}
      </m.span>
    </TooltipTrigger>
    <TooltipContent side="right" className="max-lg:hidden">{label}</TooltipContent>
  </Tooltip>;
}

/** §4.2: topbar scrolls away; scrolling back up ≥ 8 px brings it back. */
function useTopbarHidden() {
  const { scrollY } = useScroll();
  const [value, setValue] = useState(false);
  const anchor = useRef(0);
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (y < 96) { anchor.current = y; setValue(false); return; }
    if (y > previous) { anchor.current = y; setValue(true); return; }
    if (anchor.current - y >= 8) setValue(false);
  });
  return { value, reveal: () => setValue(false) };
}
