"use client";

import { useEffect } from "react";
import gsap from "gsap";

type HeroRole =
  | "bg"
  | "eyebrow"
  | "heading"
  | "lead"
  | "cta"
  | "media-main"
  | "media-side"
  | "bento";

function initialVars(role: HeroRole, d: number): gsap.TweenVars {
  switch (role) {
    case "bg":
      return { autoAlpha: 0, scale: 1.05 };
    case "eyebrow":
      return { autoAlpha: 0, y: 14 * d };
    case "heading":
      return { autoAlpha: 0, y: 26 * d };
    case "lead":
      return { autoAlpha: 0, y: 18 * d };
    case "cta":
      return { autoAlpha: 0, y: 14 * d };
    case "media-main":
      return { autoAlpha: 0, y: 22 * d, scale: 1.035 };
    case "media-side":
      return { autoAlpha: 0, y: 18 * d, scale: 1.035 };
    case "bento":
      return { autoAlpha: 0, y: 16 * d };
  }
}

/**
 * Orkestrasi animasi masuk hero section setelah loading state selesai
 * (baik streaming awal maupun transisi halaman PageTransitionLoader).
 */
export function HeroMotion() {
  useEffect(() => {
    const section = document.getElementById("beranda");
    if (!section) return;

    const elements = Array.from(
      section.querySelectorAll<HTMLElement>("[data-hero-anim]"),
    );
    if (!elements.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      elements.forEach((el) => {
        el.dataset.heroRevealed = "true";
      });
      return;
    }

    const compact = window.innerWidth < 768;
    const d = compact ? 0.5 : 1;

    const byRole = new Map<HeroRole, HTMLElement[]>();
    for (const el of elements) {
      const role = el.dataset.heroAnim as HeroRole | undefined;
      if (!role) continue;
      gsap.set(el, initialVars(role, d));
      const list = byRole.get(role) ?? [];
      list.push(el);
      byRole.set(role, list);
    }

    let timeline: gsap.core.Timeline | null = null;
    let rafId = 0;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let started = false;

    const play = () => {
      if (started) return;
      started = true;
      window.removeEventListener("page:transition-end", onTransitionEnd);
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      timeline = gsap.timeline({
        onComplete: () => {
          elements.forEach((el) => {
            el.dataset.heroRevealed = "true";
          });
          gsap.set(elements, { clearProps: "transform,opacity,visibility" });
        },
      });

      const addStep = (
        role: HeroRole,
        vars: gsap.TweenVars,
        position: number,
      ) => {
        const targets = byRole.get(role);
        if (!targets?.length) return;
        timeline!.to(targets, vars, position);
      };

      addStep(
        "bg",
        { autoAlpha: 1, scale: 1, duration: 1.15, ease: "expo.out" },
        0,
      );
      addStep(
        "eyebrow",
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" },
        0,
      );
      addStep(
        "media-main",
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.05, ease: "expo.out" },
        0.04,
      );
      addStep(
        "heading",
        { autoAlpha: 1, y: 0, duration: 0.95, ease: "expo.out" },
        0.08,
      );
      addStep(
        "lead",
        { autoAlpha: 1, y: 0, duration: 0.85, ease: "expo.out" },
        0.18,
      );
      addStep(
        "media-side",
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.95, ease: "expo.out" },
        0.18,
      );
      addStep(
        "cta",
        { autoAlpha: 1, y: 0, duration: 0.75, ease: "power3.out" },
        0.28,
      );
      addStep(
        "bento",
        { autoAlpha: 1, y: 0, duration: 0.85, ease: "expo.out" },
        0.3,
      );
    };

    const onTransitionEnd = () => {
      rafId = requestAnimationFrame(play);
    };

    if (document.documentElement.dataset.pageTransitioning === "true") {
      window.addEventListener("page:transition-end", onTransitionEnd, {
        once: true,
      });
      // Pengaman jika transisi terhenti sebelum event selesai terpicu.
      fallbackTimer = setTimeout(play, 1600);
    } else {
      rafId = requestAnimationFrame(play);
    }

    return () => {
      window.removeEventListener("page:transition-end", onTransitionEnd);
      if (rafId) cancelAnimationFrame(rafId);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      timeline?.kill();
      gsap.killTweensOf(elements);
      elements.forEach((el) => {
        el.dataset.heroRevealed = "true";
      });
      gsap.set(elements, { clearProps: "transform,opacity,visibility" });
    };
  }, []);

  return null;
}
