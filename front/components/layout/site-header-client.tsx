"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

export function SiteHeaderClient({
  showTrainer,
  showContact,
  home,
}: {
  showTrainer: boolean;
  showContact: boolean;
  home: boolean;
}) {
  const [active, setActive] = useState("");
  const [heroVisible, setHeroVisible] = useState(home);
  const [scrollHidden, setScrollHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const hidden = home && (heroVisible || scrollHidden);
  const items = navigationItems
    .filter((item) => item.id !== "trainer" || showTrainer)
    .filter((item) => item.id !== "kontak" || showContact);

  useEffect(() => {
    const update = (event: Event) => setActive((event as CustomEvent<string>).detail);
    window.addEventListener("home:chapter", update);
    return () => window.removeEventListener("home:chapter", update);
  }, []);

  useEffect(() => {
    if (!home) return;
    const hero = document.getElementById("beranda");
    const header = headerRef.current;
    if (!hero || !header) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastY = window.scrollY;

    const update = () => {
      const heroStillVisible = hero.getBoundingClientRect().top + hero.offsetHeight / 2 > 0;
      setHeroVisible(heroStillVisible);

      const y = window.scrollY;
      if (
        heroStillVisible ||
        reduced ||
        header.hasAttribute("data-menu-open") ||
        header.contains(document.activeElement)
      ) {
        setScrollHidden(false);
        lastY = y;
        return;
      }

      const delta = y - lastY;
      if (delta > 4) setScrollHidden(true);
      else if (delta < -4) setScrollHidden(false);
      lastY = y;
    };

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
        ref={headerRef}
        data-site-header
        aria-hidden={hidden}
        inert={hidden}
        className={`tone-canvas border-b border-[var(--tone-rule)] bg-[var(--tone-bg)] text-[var(--tone-ink)] ${home
          ? "fixed inset-x-0 top-0 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
          : "sticky top-0"
          } z-40 ${hidden
            ? "pointer-events-none -translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
          }`}
      >
        <div className="home-container flex min-h-[var(--masthead-height)] items-center justify-between gap-6">
          <Link
            className="inline-flex min-h-11 items-center"
            href="/"
            aria-label="Albana Speech Academy, beranda"
          >
            <span
              className="academy-hero-logo-blue block aspect-[120/46] h-9 md:h-10 dark:hidden"
              role="img"
              aria-label="Albana Speech Academy"
            />
            <BrandLogo
              src="/logo-white.png"
              imageClassName="object-contain"
              sizes="104px"
              className="hidden h-9 md:h-10 dark:block"
            />
          </Link>

          <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Navigasi utama">
            {items.map((item) => (
              <Link
                key={item.id}
                className="text-xs relative inline-flex min-h-11 items-center font-medium uppercase tracking-wide text-[var(--tone-ink)] transition-colors hover:text-[var(--tone-accent)]"
                href={item.href}
                aria-current={active === item.id ? "location" : undefined}
              >
                {item.label}
                {active === item.id ? (
                  <m.span
                    layoutId="home-nav-active"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--tone-sun)]"
                  />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link className="button-primary hidden rounded-xs md:inline-flex" href="/#jadwal">
              Lihat jadwal
            </Link>
            <MobileMenu items={items} />
          </div>
        </div>
        <div
          data-scroll-progress
          className="h-0.5 w-full origin-left scale-x-0 bg-[var(--tone-sun)]"
          aria-hidden="true"
        />
      </header>
      <ThemeToggle className="tone-canvas fixed right-5 bottom-5 z-50 inline-flex size-12 items-center justify-center rounded-full border border-[var(--tone-rule)] bg-[var(--tone-tile)] text-[var(--tone-ink)] shadow-lg transition-transform hover:scale-105 hover:bg-[var(--tone-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] sm:right-6 sm:bottom-6" />
    </MotionProvider>
  );
}
