"use client";

import { useEffect, useState } from "react";

type ProgramNavItem = {
  slug: string;
  title: string;
};

export function ProgramMobileTracker({ items }: { items: ProgramNavItem[] }) {
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.slug))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const updateActive = () => {
      const anchor = window.innerHeight * 0.35;
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= anchor) {
          current = el.id;
        }
      }
      setActiveSlug(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  if (items.length === 0) return null;

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.slug === activeSlug)
  );
  const activeItem = items[activeIndex] ?? items[0];

  return (
    <div
      aria-label="Navigasi sub-program"
      className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-3 border-y border-[var(--tone-rule)] bg-[var(--tone-bg)]/95 px-4 py-2.5 backdrop-blur-xs md:hidden"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="type-small shrink-0 italic tabular-nums text-[var(--tone-accent)]">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span className="h-3.5 w-px shrink-0 bg-[var(--tone-rule)]" aria-hidden="true" />
        <p className="truncate text-sm font-semibold text-[var(--tone-ink)]">
          {activeItem.title}
        </p>
      </div>

      {items.length > 1 ? (
        <nav className="flex shrink-0 items-center gap-1" aria-label="Pilih sub-program">
          {items.map((item, idx) => {
            const isActive = item.slug === activeItem.slug;
            return (
              <a
                key={item.slug}
                href={`#${item.slug}`}
                aria-current={isActive ? "location" : undefined}
                aria-label={`${idx + 1}. ${item.title}`}
                className={`inline-flex min-h-8 min-w-8 items-center justify-center rounded-xs px-1.5 text-xs font-semibold tabular-nums transition-colors ${
                  isActive
                    ? "bg-[var(--tone-accent)] text-[var(--tone-tile)]"
                    : "border border-[var(--tone-rule)] bg-[var(--tone-tile)] text-[var(--tone-muted)] hover:text-[var(--tone-ink)]"
                }`}
              >
                {String(idx + 1).padStart(2, "0")}
              </a>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
