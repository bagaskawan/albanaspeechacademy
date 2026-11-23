"use client";

import { useRef } from "react";
import { useIsDark } from "@/lib/use-is-dark";
import { Moon, Sun } from "lucide-react";

type ViewTransitionLike = {
  ready: Promise<void>;
  finished: Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
};

export function ThemeToggle({ className }: { className?: string } = {}) {
  const dark = useIsDark();
  const fallbackTimerRef = useRef<number | null>(null);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
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

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      applyTheme();
      return;
    }

    const doc = document as ViewTransitionDocument;
    if (typeof doc.startViewTransition === "function") {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      root.classList.add("theme-vt-active");
      const transition = doc.startViewTransition(() => {
        applyTheme();
      });

      transition.ready
        .then(() => {
          root.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 620,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {
          // Abaikan jika transisi dibatalkan oleh klik cepat beruntun.
        });

      transition.finished.finally(() => {
        root.classList.remove("theme-vt-active");
      });
      return;
    }

    // Fallback halus untuk peramban tanpa View Transitions API.
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
    }
    root.classList.add("theme-transition");
    applyTheme();
    fallbackTimerRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transition");
      fallbackTimerRef.current = null;
    }, 460);
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
