"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { m } from "motion/react";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { BrandLogo } from "./brand-logo";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

const navigationItems = [
  { href: "/#program", label: "Program", id: "program" },
  { href: "/#tentang", label: "Tentang", id: "tentang" },
  { href: "/#trainer", label: "Trainer", id: "trainer" },
  { href: "/#jadwal", label: "Jadwal", id: "jadwal" },
  { href: "/#kontak", label: "Kontak", id: "kontak" },
] as const;

export function SiteHeaderClient({ showTrainer, showContact, home }: { showTrainer: boolean; showContact: boolean; home: boolean }) {
  const [active, setActive] = useState("");
  const [heroVisible, setHeroVisible] = useState(home);
  const items = navigationItems.filter((item) => item.id !== "trainer" || showTrainer).filter((item) => item.id !== "kontak" || showContact);
  useEffect(() => {
    const update = (event: Event) => setActive((event as CustomEvent<string>).detail);
    window.addEventListener("home:chapter", update);
    return () => window.removeEventListener("home:chapter", update);
  }, []);

  useEffect(() => {
    if (!home) return;
    const hero = document.getElementById("beranda");
    if (!hero) return;
    const update = () => setHeroVisible(hero.getBoundingClientRect().top + hero.offsetHeight / 2 > 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [home]);

  return (
    <MotionProvider>
      <header
        data-site-header
        aria-hidden={home && heroVisible}
        inert={home && heroVisible}
        className={`${home ? "fixed inset-x-0 top-0 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none" : "sticky top-0"} z-40 bg-card ${heroVisible ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
      >
        <div className="mx-auto flex min-h-[var(--masthead-height)] max-w-7xl items-center justify-between gap-4 px-5 md:px-8 xl:px-12">
          <Link className="inline-flex min-h-11 items-center" href="/" aria-label="Albana Speech Academy, beranda">
            <BrandLogo className="h-9 md:h-10 dark:hidden" />
            <BrandLogo src="/logo-white.png" imageClassName="object-contain" className="hidden h-9 md:h-10 dark:block" />
          </Link>
          <nav className="hidden items-center gap-5 md:flex" aria-label="Navigasi utama">
            {items.map((item) => <Link key={item.id} className="relative inline-flex min-h-11 items-center text-sm font-medium text-ink hover:text-accent dark:text-white dark:hover:text-[#dcebfa]" href={item.href} aria-current={active === item.id ? "location" : undefined}>
              {item.label}
              {active === item.id ? <m.span layoutId="home-nav-active" className="absolute inset-x-0 bottom-1 h-0.5 bg-accent" /> : null}
            </Link>)}
          </nav>
          <div className="flex items-center gap-2"><Link className="button-primary hidden md:inline-flex" href="/#jadwal">Lihat jadwal</Link><ThemeToggle /><MobileMenu items={items} /></div>
        </div>
        <div data-scroll-progress className="h-0.5 w-full origin-left scale-x-0 bg-accent" aria-hidden="true" />
      </header>
    </MotionProvider>
  );
}
