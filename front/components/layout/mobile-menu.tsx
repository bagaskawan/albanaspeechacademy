"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";

type NavigationItem = {
  href: string;
  label: string;
};

type MobileMenuProps = {
  items: readonly NavigationItem[];
};

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const header = triggerRef.current?.closest("header");
    header?.setAttribute("data-menu-open", "");
    header?.removeAttribute("data-hidden");
    const frame = requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>("#mobile-navigation a")?.focus());

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      cancelAnimationFrame(frame);
      header?.removeAttribute("data-menu-open");
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-control border border-control bg-transparent px-4 text-sm font-semibold hover:bg-card md:min-w-23 md:gap-3"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{isOpen ? "Tutup menu" : "Buka menu"}</span>
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>

      <AnimatePresence initial={false}>
      {isOpen ? (
        <m.nav
          id="mobile-navigation"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 top-full z-50 grid gap-1 rounded-panel border border-rule bg-card p-2"
          aria-label="Navigasi seluler"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              className="nav-link px-4"
              href={item.href}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </m.nav>
      ) : null}
      </AnimatePresence>
    </div>
  );
}
