"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { HomePartner } from "@/lib/home-data";
import { PartnerLogo } from "./partner-logo";

export function PartnerMarquee({ partners }: { partners: HomePartner[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const manuallyPausedRef = useRef(false);

  useEffect(() => {
    manuallyPausedRef.current = manuallyPaused;
  }, [manuallyPaused]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || partners.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      if (!pausedRef.current && !manuallyPausedRef.current) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          el.scrollLeft += (dt / 1000) * 32;
          if (el.scrollLeft >= half) {
            el.scrollLeft -= half;
          }
        }
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [partners.length]);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (half <= 0) return;
    if (el.scrollLeft >= half) {
      el.scrollLeft -= half;
    } else if (el.scrollLeft <= 0 && pausedRef.current) {
      el.scrollLeft += half;
    }
  };

  return (
    <div className="sm:hidden">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={() => { pausedRef.current = true; }}
        onTouchEnd={() => { pausedRef.current = false; }}
        onTouchCancel={() => { pausedRef.current = false; }}
        onPointerDown={() => { pausedRef.current = true; }}
        onPointerUp={() => { pausedRef.current = false; }}
        className="mt-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max">
          {[...partners, ...partners].map((partner, idx) => {
            const isClone = idx >= partners.length;
            return (
              <li
                key={`${partner.id}-${idx}`}
                aria-hidden={isClone || undefined}
                className="mr-4 flex h-24 w-36 shrink-0 items-center justify-center border-t border-[var(--tone-rule)] px-2 pt-3"
              >
                {partner.logoUrl ? (
                  <PartnerLogo src={partner.logoUrl} alt={isClone ? "" : (partner.name || "Partner Albana Speech Academy")} />
                ) : partner.name ? (
                  <span className="type-small text-center font-medium text-[var(--tone-ink)] opacity-80">{partner.name}</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        aria-pressed={manuallyPaused}
        onClick={() => setManuallyPaused((prev) => !prev)}
        className="type-small mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 text-[var(--tone-muted)]"
      >
        {manuallyPaused ? (
          <>
            <Play aria-hidden="true" className="size-4" /> Putar logo
          </>
        ) : (
          <>
            <Pause aria-hidden="true" className="size-4" /> Jeda logo
          </>
        )}
      </button>
    </div>
  );
}
