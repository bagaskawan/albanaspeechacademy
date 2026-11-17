"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global { interface Window { __lenis?: Lenis } }

gsap.registerPlugin(ScrollTrigger);

export function HomeScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const lenis = !reduced && finePointer ? new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false }) : null;
    if (lenis) window.__lenis = lenis;
    const tick = (time: number) => lenis?.raf(time * 1000);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
    }

    const animations: ScrollTrigger[] = [];
    const counted = new WeakSet<Element>();
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const progress = header?.querySelector<HTMLElement>("[data-scroll-progress]");
    if (header && progress && !reduced) {
      animations.push(ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (trigger) => {
          gsap.set(progress, { scaleX: trigger.progress });
        },
      }));
    }
    const seen = new WeakSet<Element>();
    const chapterSeen = new WeakSet<Element>();
    const initialVisible = new WeakSet<Element>();
    const drawAccent = (element: HTMLElement, delay: number) => {
      const marks = element.querySelectorAll(".accent-serif");
      if (marks.length) gsap.delayedCall(delay, () => marks.forEach((mark) => mark.classList.add("is-drawn")));
    };
    const run = (element: HTMLElement, direction: 1 | -1) => {
      const kind = element.dataset.motion;
      const horizontal = kind === "slide";
      const media = kind === "media";
      const heading = kind === "heading" || kind === "chapter";
      const distance = window.innerWidth < 768 ? 16 : 32;
      const bento = media ? element.closest("[data-bento]") : null;
      const bentoIndex = bento
        ? Array.from(bento.querySelectorAll<HTMLElement>("[data-motion='media']")).indexOf(element)
        : -1;
      const delay = bentoIndex > 0 ? bentoIndex * 0.12 : 0;
      gsap.killTweensOf(element);
      if (reduced) {
        gsap.fromTo(element, { opacity: 0 }, { opacity: 1, duration: 0.15, clearProps: "opacity" });
      } else {
        gsap.fromTo(element,
          { opacity: 0, x: horizontal ? direction * distance : 0, y: horizontal ? 0 : direction * (media ? 12 : 28), yPercent: heading ? direction * 105 : 0, scale: media ? (window.innerWidth < 768 ? 1.06 : 1.12) : 1 },
          { opacity: 1, x: 0, y: 0, yPercent: 0, scale: 1, duration: media ? 0.9 : heading ? 0.7 : horizontal ? 0.5 : 0.6, delay, ease: media || heading ? "expo.out" : "power2.out", clearProps: "transform,opacity", onComplete: () => drawAccent(element, 0.2) },
        );
      }
    };
    const setup = () => {
      for (const id of ["program", "tentang", "trainer", "jadwal", "kontak"]) {
        const section = document.getElementById(id);
        if (!section || chapterSeen.has(section)) continue;
        chapterSeen.add(section);
        animations.push(ScrollTrigger.create({ trigger: section, start: "top 45%", end: "bottom 45%", onToggle: (trigger) => {
          if (trigger.isActive) window.dispatchEvent(new CustomEvent("home:chapter", { detail: id }));
        } }));
      }
      document.querySelectorAll(".accent-serif:not(.is-drawn)").forEach((mark) => {
        const kind = mark.closest<HTMLElement>("[data-motion]")?.dataset.motion;
        if (reduced || (kind !== "heading" && kind !== "chapter")) mark.classList.add("is-drawn");
      });
      document.querySelectorAll<HTMLElement>("main [data-motion]").forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        if (element.dataset.motion === "bar") {
          if (!reduced) animations.push(ScrollTrigger.create({ trigger: element.closest("section") ?? element, start: "top 80%", end: "center 50%", scrub: 0.6, animation: gsap.fromTo(element, { scaleX: 0 }, { scaleX: 1, ease: "none" }) }));
          return;
        }
        if (element.dataset.motion === "count") {
          if (!reduced) animations.push(ScrollTrigger.create({ trigger: element, start: "top 85%", onEnter: () => {
            if (counted.has(element)) return;
            counted.add(element);
            const final = Number(element.dataset.value);
            if (!Number.isFinite(final)) return;
            const counter = { value: 0 };
            gsap.to(counter, { value: final, duration: 0.9, ease: "power2.out", onUpdate: () => { element.textContent = `${Math.round(counter.value)}%`; } });
          } }));
          return;
        }
        if (element.dataset.motion === "chapter" && !reduced && window.innerWidth >= 1024) {
          element.querySelectorAll(".accent-serif").forEach((m) => m.classList.add("is-drawn"));
          animations.push(ScrollTrigger.create({ trigger: element, start: "top 90%", end: "top 35%", scrub: 0.6,
            animation: gsap.fromTo(element, { scale: 0.86, opacity: 0.2, xPercent: -4, transformOrigin: "left bottom" }, { scale: 1, opacity: 1, xPercent: 0, ease: "none", immediateRender: true }) }));
          return;
        }
        if (element.getBoundingClientRect().top < window.innerHeight * 0.85) initialVisible.add(element);
        animations.push(ScrollTrigger.create({
          trigger: element,
          start: "top 85%",
          end: "bottom 15%",
          onEnter: () => { if (initialVisible.has(element)) { initialVisible.delete(element); drawAccent(element, 0.9); } else run(element, 1); },
          onEnterBack: () => { if (!reduced) run(element, -1); },
          onLeave: () => { if (!reduced) gsap.to(element, { opacity: 0, y: -12, duration: 0.3 }); },
          onLeaveBack: () => { if (!reduced) gsap.to(element, { opacity: 0, y: 12, duration: 0.3 }); },
        }));
      });
      ScrollTrigger.refresh();
    };
    setup();
    const observer = new MutationObserver(setup);
    observer.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.kill());
      gsap.ticker.remove(tick);
      lenis?.destroy();
      delete window.__lenis;
      document.documentElement.classList.remove("motion-ready");
      header?.removeAttribute("data-hidden");
      document.querySelectorAll<HTMLElement>("main [data-motion]").forEach((element) => gsap.set(element, { clearProps: "transform,opacity" }));
    };
  }, []);

  return null;
}
