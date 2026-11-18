"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global { interface Window { __lenis?: Lenis } }

gsap.registerPlugin(ScrollTrigger);

type RevealKind = "heading" | "rise" | "slide" | "media";

/** Titik awal tiap jenis gerak masuk. Jarak dipotong setengah di layar < 768 px. */
function revealFrom(kind: RevealKind, compact: boolean): gsap.TweenVars {
  const d = compact ? 0.5 : 1;
  switch (kind) {
    case "heading": return { autoAlpha: 0, y: 32 * d };
    case "slide": return { autoAlpha: 0, x: 28 * d };
    case "media": return { autoAlpha: 0, y: 20 * d, scale: compact ? 1.03 : 1.06 };
    default: return { autoAlpha: 0, y: 24 * d };
  }
}

/** Durasi dan kurva: judul dan foto memakai expo yang panjang dan lembut, isi lain lebih singkat. */
function revealTo(kind: RevealKind): gsap.TweenVars {
  const slow = kind === "heading" || kind === "media";
  return {
    autoAlpha: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration: slow ? 1.1 : 0.8,
    ease: slow ? "expo.out" : "power3.out",
    stagger: kind === "media" ? 0.09 : 0.07,
    overwrite: true,
    clearProps: "transform,opacity,visibility",
  };
}

const REVEAL_KINDS: RevealKind[] = ["heading", "rise", "slide", "media"];

export function HomeScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const compact = window.innerWidth < 768;

    // Lenis hanya untuk pointer halus; GSAP ticker menggerakkannya agar satu jam animasi.
    const lenis = !reduced && finePointer ? new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false }) : null;
    const tick = (time: number) => lenis?.raf(time * 1000);
    if (lenis) {
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const triggers: ScrollTrigger[] = [];
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const progress = header?.querySelector<HTMLElement>("[data-scroll-progress]");
    if (progress && !reduced) {
      const setProgress = gsap.quickSetter(progress, "scaleX");
      triggers.push(ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => setProgress(self.progress) }));
    }

    const seen = new WeakSet<Element>();
    const counted = new WeakSet<Element>();
    const chapterSeen = new WeakSet<Element>();

    const setup = () => {
      for (const id of ["program", "tentang", "trainer", "jadwal", "kontak"]) {
        const section = document.getElementById(id);
        if (!section || chapterSeen.has(section)) continue;
        chapterSeen.add(section);
        triggers.push(ScrollTrigger.create({
          trigger: section,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) window.dispatchEvent(new CustomEvent("home:chapter", { detail: id }));
          },
        }));
      }

      const fresh: Record<RevealKind, HTMLElement[]> = { heading: [], rise: [], slide: [], media: [] };
      let added = false;

      document.querySelectorAll<HTMLElement>("main [data-motion]").forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        added = true;
        const kind = element.dataset.motion;

        if (kind === "bar") {
          if (reduced) return;
          const vertical = element.classList.contains("origin-bottom");
          triggers.push(ScrollTrigger.create({
            trigger: element.closest("section") ?? element,
            start: "top 80%",
            end: "center 55%",
            scrub: 0.8,
            animation: gsap.fromTo(element, vertical ? { scaleY: 0 } : { scaleX: 0 }, vertical ? { scaleY: 1, ease: "none" } : { scaleX: 1, ease: "none" }),
          }));
          return;
        }

        if (kind === "count") {
          if (reduced) return;
          triggers.push(ScrollTrigger.create({
            trigger: element,
            start: "top 85%",
            once: true,
            onEnter: () => {
              if (counted.has(element)) return;
              counted.add(element);
              const final = Number(element.dataset.value);
              if (!Number.isFinite(final)) return;
              const counter = { value: 0 };
              gsap.to(counter, {
                value: final,
                duration: 1.1,
                ease: "power3.out",
                onUpdate: () => { element.textContent = `${Math.round(counter.value)}%`; },
              });
            },
          }));
          return;
        }

        // "chapter" diperlakukan sebagai judul; elemen di dalam pembungkus bergerak ikut induknya.
        const reveal = (kind === "chapter" ? "heading" : kind) as RevealKind;
        if (!REVEAL_KINDS.includes(reveal) || reduced) return;
        if (element.parentElement?.closest("[data-motion]:not([data-motion='bar']):not([data-motion='count'])")) return;
        // Yang sudah terlihat saat dimuat tidak disembunyikan (hindari kedip konten di atas lipatan).
        if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

        gsap.set(element, revealFrom(reveal, compact));
        fresh[reveal].push(element);
      });

      for (const kind of REVEAL_KINDS) {
        if (!fresh[kind].length) continue;
        // batch: elemen yang masuk bersamaan (satu baris kartu, satu bento) mendapat stagger alami.
        // Lompat anchor bisa melewati elemen tanpa onEnter; onLeave/onEnterBack memastikan tidak ada yang tertinggal tersembunyi.
        const animate = (batch: Element[]) => gsap.to(batch, revealTo(kind));
        const settle = (batch: Element[]) => gsap.set(batch, { autoAlpha: 1, clearProps: "transform,opacity,visibility" });
        triggers.push(...ScrollTrigger.batch(fresh[kind], {
          start: "top 88%",
          end: "bottom top",
          once: true,
          interval: 0.12,
          onEnter: animate,
          onEnterBack: animate,
          onLeave: settle,
          onLeaveBack: settle,
        }));
      }

      if (added) ScrollTrigger.refresh();
    };

    setup();

    // Hitung-naik angka mengganti teks tiap frame; abaikan mutasi itu dan gabungkan sisanya per frame.
    let queued = 0;
    const observer = new MutationObserver((mutations) => {
      if (mutations.every((mutation) => (mutation.target as Element).closest?.("[data-motion='count']"))) return;
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; setup(); });
    });
    observer.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(queued);
      triggers.forEach((trigger) => trigger.kill());
      gsap.ticker.remove(tick);
      if (lenis) gsap.ticker.lagSmoothing(500, 33);
      lenis?.destroy();
      delete window.__lenis;
      document.documentElement.classList.remove("motion-ready");
      header?.removeAttribute("data-hidden");
      document.querySelectorAll<HTMLElement>("main [data-motion]").forEach((element) => {
        gsap.killTweensOf(element);
        gsap.set(element, { clearProps: "transform,opacity,visibility" });
      });
    };
  }, []);

  return null;
}
