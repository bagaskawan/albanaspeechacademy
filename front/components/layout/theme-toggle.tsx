"use client";

import { useIsDark } from "@/lib/use-is-dark";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string } = {}) {
  const dark = useIsDark();

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={className ?? "inline-flex size-11 items-center justify-center border border-control bg-card text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"}
      aria-label={dark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
      title={dark ? "Tema terang" : "Tema gelap"}
    >
      {dark ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
    </button>
  );
}
