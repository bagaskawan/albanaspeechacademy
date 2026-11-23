"use client";

import { useRef } from "react";
import { useIsDark } from "@/lib/use-is-dark";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string } = {}) {
  const dark = useIsDark();
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    const applyTheme = () => {
      root.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // Mode privat: cukup ubah kelas di DOM.
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyTheme();
      return;
    }

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    root.classList.add("theme-transition");
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      applyTheme();
      timerRef.current = window.setTimeout(() => {
        root.classList.remove("theme-transition");
        timerRef.current = null;
      }, 420);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        className ??
        "inline-flex size-11 cursor-pointer items-center justify-center border border-control bg-card text-ink transition-transform duration-300 hover:bg-surface active:scale-95 dark:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      }
      aria-label={dark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
      title={dark ? "Tema terang" : "Tema gelap"}
    >
      <span className="relative inline-flex size-5 items-center justify-center">
        <Sun
          aria-hidden="true"
          size={19}
          className={`absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            dark ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"
          }`}
        />
        <Moon
          aria-hidden="true"
          size={19}
          className={`absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            dark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        />
      </span>
    </button>
  );
}
