"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Dialog } from "radix-ui";
import {
  BookOpen, Building2, CalendarRange, ChevronDown, Film, Handshake, Images, Landmark, LayoutDashboard,
  LogOut, Menu, Newspaper, PanelLeftClose, PanelLeftOpen, Phone, Quote, ReceiptText, UserRound, Users, type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { adminNavGroups, resolveAdminNav, type AdminNavGroup, type AdminNavIcon, type AdminNavModule } from "@/lib/admin-nav";
import { ease, transition } from "@/lib/motion/tokens";
import { createClient } from "@/lib/supabase/client";

const icons: Record<AdminNavIcon, LucideIcon> = {
  dashboard: LayoutDashboard, users: Users, receipt: ReceiptText, book: BookOpen, calendar: CalendarRange,
  trainer: UserRound, article: Newspaper, media: Film, gallery: Images, quote: Quote, partner: Handshake,
  academy: Building2, contact: Phone, bank: Landmark,
};

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";
const roundButton = `inline-flex size-11 shrink-0 items-center justify-center rounded-full text-admin-ink transition-colors duration-[var(--dur-hover)] hover:bg-admin-surface-muted ${focusRing}`;

const OPEN_KEY = "admin-nav-open";
const COMPACT_KEY = "admin-nav-compact";

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
function store(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: keep in memory only */ }
}

type ShellProps = { children: React.ReactNode; pendingInvoices: number; account: string | null };

export function AdminShell({ children, pendingInvoices, account }: ShellProps) {
  const pathname = usePathname();
  const nav = resolveAdminNav(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // null = follow the breakpoint (compact 1024–1279, full ≥ 1280); read after hydration.
  const [compact, setCompact] = useState<boolean | null>(null);
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Restoring per-viewer preferences after hydration avoids a server/client mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    setCompact(readStored<boolean | null>(COMPACT_KEY, null));
    setClosed(readStored<Record<string, boolean>>(OPEN_KEY, {}));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function toggleGroup(id: string) {
    setClosed((previous) => {
      const next = { ...previous, [id]: !previous[id] };
      store(OPEN_KEY, next);
      return next;
    });
  }
  function toggleCompact() {
    const isCompactNow = compact ?? window.matchMedia("(max-width: 1279px)").matches;
    setCompact(!isCompactNow);
    store(COMPACT_KEY, !isCompactNow);
  }

  const sidebarProps = { activeGroupId: nav.group.id, activeHref: nav.module?.href ?? (pathname === "/admin" ? "/admin" : undefined), pendingInvoices, account, closed, toggleGroup };

  return <TooltipProvider delayDuration={200}>
    <div className="min-h-screen text-admin-ink lg:flex">
      {/* < 1024 px: a slim bar that only opens the drawer. */}
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <div className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-admin-line bg-admin-canvas px-4 lg:hidden">
          <Dialog.Trigger aria-label="Buka menu" className={roundButton}><Menu aria-hidden="true" size={20} strokeWidth={1.5} /></Dialog.Trigger>
          <LogoLink />
          <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{nav.module?.label ?? nav.group.label}</span>
          {pendingInvoices > 0 && <Badge count={pendingInvoices} />}
        </div>
        <AnimatePresence>
          {drawerOpen && <Dialog.Portal forceMount key="admin-drawer">
            <Dialog.Overlay asChild forceMount>
              <m.div className="fixed inset-0 z-50 bg-black/30 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: transition.exit }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <m.div
                className="fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] p-3 lg:hidden"
                initial={{ x: "-100%" }} animate={{ x: 0, transition: transition.overlay }} exit={{ x: "-100%", transition: transition.exit }}
              >
                <Dialog.Title className="sr-only">Menu CMS</Dialog.Title>
                <SidebarPanel {...sidebarProps} mode="full" layoutGroup="drawer" onNavigate={() => setDrawerOpen(false)} />
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>}
        </AnimatePresence>
      </Dialog.Root>

      {/* ≥ 1024 px: the sidebar. */}
      <aside className="sticky top-0 hidden h-screen shrink-0 p-3 lg:block">
        <SidebarPanel {...sidebarProps} mode={compact === null ? "auto" : compact ? "compact" : "full"} layoutGroup="sidebar" onToggleCompact={toggleCompact} />
      </aside>

      <div className="min-w-0 flex-1 px-[var(--admin-gutter)] pb-10 pt-6 lg:pt-10">
        <div className="mx-auto max-w-[1440px]">
          <PageHeader group={nav.group} module={nav.module} isDetail={nav.isDetail} pathname={pathname} />
          <main id="admin-main" className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  </TooltipProvider>;
}

function LogoLink({ withName = false, nameClass = "" }: { withName?: boolean; nameClass?: string }) {
  return <Link href="/admin" aria-label="Albana CMS, ke Dashboard" className={`flex min-w-0 items-center gap-3 rounded-full ${focusRing}`}>
    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0b0b0b]">
      <Image src="/images/Albana-Speech-Academy-Logo-White.png" alt="" width={28} height={28} className="size-7 object-contain" priority />
    </span>
    {withName && <span className={`truncate text-[15px] font-medium ${nameClass}`}>Albana CMS</span>}
  </Link>;
}

type SidebarProps = {
  mode: "full" | "compact" | "auto";
  layoutGroup: string;
  activeGroupId: AdminNavGroup["id"];
  activeHref?: string;
  pendingInvoices: number;
  account: string | null;
  closed: Record<string, boolean>;
  toggleGroup: (id: string) => void;
  onNavigate?: () => void;
  onToggleCompact?: () => void;
};

function SidebarPanel({ mode, layoutGroup, activeGroupId, activeHref, pendingInvoices, account, closed, toggleGroup, onNavigate, onToggleCompact }: SidebarProps) {
  // "auto" is compact only between 1024 and 1279 px, decided in CSS so the first paint is right.
  const width = mode === "full" ? "w-[264px]" : mode === "compact" ? "w-20" : "w-20 xl:w-[264px]";
  const label = mode === "full" ? "" : mode === "compact" ? "sr-only" : "sr-only xl:not-sr-only";
  const onlyCompact = mode === "full" ? "hidden" : mode === "compact" ? "" : "xl:hidden";
  const onlyFull = mode === "full" ? "" : mode === "compact" ? "hidden" : "max-xl:hidden";
  const compactish = mode !== "full";
  const [dashboard, ...groups] = adminNavGroups;

  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/login");
  }

  return <div className={`flex h-full ${width} flex-col rounded-[var(--admin-radius-card)] bg-admin-surface`}>
    <div className="flex items-center justify-between gap-2 p-[18px]">
      <LogoLink withName nameClass={label} />
    </div>

    <nav aria-label="Navigasi CMS" className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
      <NavItem item={{ ...dashboard, description: "" }} active={activeHref === dashboard.href} layoutGroup={layoutGroup} labelClass={label} tooltip={compactish} onNavigate={onNavigate} />
      {groups.map((group) => {
        const isOpen = group.id === activeGroupId || !closed[group.id];
        const showGroupBadge = group.id === "pendaftaran" && !isOpen && pendingInvoices > 0;
        return <div key={group.id} className="mt-5">
          <div aria-hidden="true" className={`mx-3 mb-2 border-t border-admin-line ${onlyCompact}`} />
          <button
            type="button"
            onClick={() => toggleGroup(group.id)}
            aria-expanded={isOpen}
            disabled={group.id === activeGroupId}
            className={`mb-1 flex h-8 w-full items-center justify-between rounded-full px-3 text-[12px] font-medium text-admin-text-secondary hover:text-admin-ink disabled:cursor-default disabled:hover:text-admin-text-secondary ${focusRing} ${onlyFull}`}
          >
            <span className="flex items-center gap-2">{group.label}{showGroupBadge && <Badge count={pendingInvoices} />}</span>
            <ChevronDown aria-hidden="true" size={16} strokeWidth={1.5} className={`transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} />
          </button>
          {/* Compact rails show every item; collapsing only applies to the labelled sidebar. */}
          <AnimatePresence initial={false}>
            {(isOpen || compactish) && <m.ul
              key="items"
              className="space-y-0.5 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1, transition: { duration: 0.2, ease: ease.out } }}
              exit={{ height: 0, opacity: 0, transition: { duration: 0.16, ease: ease.out } }}
            >
              {group.modules.map((item) => <li key={item.href} className={!isOpen ? onlyCompact : undefined}>
                <NavItem item={item} active={item.href === activeHref} layoutGroup={layoutGroup} labelClass={label} tooltip={compactish} onNavigate={onNavigate}
                  badge={item.href === "/admin/tagihan" && pendingInvoices > 0 ? pendingInvoices : 0} />
              </li>)}
            </m.ul>}
          </AnimatePresence>
        </div>;
      })}
    </nav>

    <div className={`flex items-center gap-2 border-t border-admin-line p-3 ${compactish ? "max-xl:flex-col" : ""} ${mode === "compact" ? "flex-col" : ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Menu akun" className={`flex min-w-0 flex-1 items-center gap-3 rounded-full p-1 pr-3 text-left hover:bg-admin-surface-muted ${focusRing}`}>
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-admin-ink text-[14px] font-medium uppercase text-admin-on-ink">{account?.[0] ?? "A"}</span>
          <span className={`truncate text-[14px] ${label}`}>{account ?? "Admin"}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="min-w-56 rounded-[20px] border-admin-line bg-admin-surface p-2 shadow-[var(--admin-shadow-pop)]">
          {account && <><DropdownMenuLabel className="truncate text-[13px] font-normal text-admin-text-secondary">{account}</DropdownMenuLabel><DropdownMenuSeparator /></>}
          <DropdownMenuItem onSelect={signOut}><LogOut aria-hidden="true" size={16} strokeWidth={1.5} /> Keluar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ThemeToggle className={roundButton} />
      {onToggleCompact && <button type="button" onClick={onToggleCompact} aria-label={compactish ? "Lebarkan sidebar" : "Ringkas sidebar"} className={roundButton}>
        {mode === "full" ? <PanelLeftClose aria-hidden="true" size={18} strokeWidth={1.5} /> : <PanelLeftOpen aria-hidden="true" size={18} strokeWidth={1.5} />}
      </button>}
    </div>
  </div>;
}

function NavItem({ item, active, layoutGroup, labelClass, tooltip, badge = 0, onNavigate }: {
  item: AdminNavModule; active: boolean; layoutGroup: string; labelClass: string; tooltip: boolean; badge?: number; onNavigate?: () => void;
}) {
  const Icon = icons[item.icon];
  const link = <Link
    href={item.href}
    onClick={onNavigate}
    aria-current={active ? "page" : undefined}
    className={`relative flex h-11 items-center gap-3 rounded-full px-3.5 text-[15px] transition-colors duration-[var(--dur-hover)] ${focusRing} ${active ? "font-medium text-admin-on-ink" : "text-admin-ink hover:bg-admin-surface-muted"}`}
  >
    {active && <m.span layoutId={`admin-nav-active-${layoutGroup}`} className="absolute inset-0 rounded-full bg-admin-ink" transition={{ duration: 0.28, ease: ease.inOut }} />}
    <Icon aria-hidden="true" size={18} strokeWidth={1.5} className="relative shrink-0" />
    <span className={`relative truncate ${labelClass}`}>{item.label}</span>
    {badge > 0 && <span className="relative ml-auto"><Badge count={badge} /></span>}
  </Link>;
  if (!tooltip) return link;
  return <Tooltip>
    <TooltipTrigger asChild>{link}</TooltipTrigger>
    <TooltipContent side="right" className="xl:hidden">{item.label}</TooltipContent>
  </Tooltip>;
}

function Badge({ count }: { count: number }) {
  return <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-admin-peach-dot px-1.5 text-[12px] font-medium leading-none text-[#0b0b0b]">
    <span aria-hidden="true">{count > 99 ? "99+" : count}</span>
    <span className="sr-only">{count} tagihan menunggu verifikasi</span>
  </span>;
}
