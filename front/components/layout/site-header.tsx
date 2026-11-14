import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

const navigationItems = [
  { href: "/#program-pilihan", label: "program" },
  { href: "/#trainer", label: "Trainer" },
  { href: "/#kontak", label: "Kontak" },
  // { href: "/artikel", label: "Artikel" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-card">
      <div className="relative flex min-h-[var(--masthead-height)] items-center justify-between gap-4 pl-[4.6%] pr-[8%] before:absolute before:inset-y-0 before:right-0 before:w-[5.8%] before:bg-hero-panel">
        <Link className="inline-flex min-h-11 items-center" href="/" aria-label="Albana Speech Academy, beranda">
          <BrandLogo className="h-9 md:h-10" />
        </Link>
        <nav className="hidden items-center gap-[2.2vw] md:flex" aria-label="Navigasi utama">
          {navigationItems.map((item) => (
            <Link key={item.href} className="nav-link font-bold text-muted uppercase hover:text-accent" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileMenu items={navigationItems} />
        </div>
      </div>
    </header>
  );
}
