"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
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
        <span>Menu</span>
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen ? (
        <nav
          id="mobile-navigation"
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
        </nav>
      ) : null}
    </div>
  );
}
