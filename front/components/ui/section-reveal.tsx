"use client";

import { useEffect } from "react";
import { REVEAL_TRIGGER_FRACTION, REVEAL_TRIGGER_MARGIN } from "@/lib/motion";

const SKIP_SELECTOR = "button, dialog, script, style";
const MAX_STAGGER_INDEX = 5;
// A section is prepared while its top is at most this far below the viewport (25% of
// the viewport height), so the hidden state is only ever applied off-screen.
const APPROACH_MARGIN = "0px 0px 25% 0px";
// How long to wait for React to adopt streamed content before revealing it plainly.
const HYDRATION_WAIT_FRAMES = 300;

// React stamps a fiber on every host node it has adopted. Streamed Suspense content is
// placed in the DOM before React hydrates it, so tagging it first makes hydration see
// attributes the server never rendered. Never tag a block until React owns it.
const FIBER_KEY = "__reactFiber$";
const hasReactOwner = (node: HTMLElement) => Object.keys(node).some((key) => key.startsWith(FIBER_KEY));

const isPickable = (node: Element): node is HTMLElement =>
  node instanceof HTMLElement && !node.matches(SKIP_SELECTOR);

// Picks the blocks of a section: a group of same-tag siblings animates one by one,
// anything else animates as a single block.
function pickTargets(section: HTMLElement) {
  const container = section.firstElementChild;
  if (!container) return [] as HTMLElement[];

  const targets: HTMLElement[] = [];
  for (const block of [...container.children].filter(isPickable)) {
    const siblings = [...block.children].filter(isPickable);
    const isGroup =
      siblings.length >= 2 && siblings.every((sibling) => sibling.tagName === siblings[0].tagName);
    targets.push(...(isGroup ? siblings : [block]));
  }
  return targets;
}

// Staggers the content of each section as it reaches the viewport. Classes are added
// only from the client so the page stays readable without JavaScript.
export function SectionReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const sections = [...document.querySelectorAll<HTMLElement>("main > section")].filter(
      (section) => section.id !== "hero",
    );
    if (!sections.length) return;

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("reveal-in");
          reveal.unobserve(entry.target);
        }
      },
      // Trigger the cascade only once a section has climbed about 40% up the viewport
      // (its top crosses the upper 60%).
      { rootMargin: REVEAL_TRIGGER_MARGIN, threshold: 0 },
    );

    // Tag a section's blocks only as it comes into range, never on mount. The program
    // cards stream in through Suspense and hydrate after the first commit, so tagging
    // them early makes React see attributes it never rendered. A section already past
    // the trigger line (e.g. a restored scroll position) is shown at once instead of
    // animating, so its content never flashes hidden.
    const canDetectHydration = hasReactOwner(document.body);
    let disposed = false;
    const prepare = (section: HTMLElement, attempt = 0) => {
      if (disposed) return;
      if (section.getBoundingClientRect().top < window.innerHeight * REVEAL_TRIGGER_FRACTION) {
        section.classList.add("reveal-in");
        return;
      }
      const targets = pickTargets(section);
      if (canDetectHydration && !targets.every(hasReactOwner)) {
        // Streamed content is in the DOM but React has not adopted it yet; wait a frame.
        if (attempt < HYDRATION_WAIT_FRAMES) {
          requestAnimationFrame(() => prepare(section, attempt + 1));
        } else {
          section.classList.add("reveal-in");
        }
        return;
      }
      targets.forEach((target, index) => {
        target.classList.add("reveal-item");
        target.style.setProperty("--reveal-index", String(Math.min(index, MAX_STAGGER_INDEX)));
      });
      reveal.observe(section);
    };

    const approach = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          approach.unobserve(entry.target);
          prepare(entry.target as HTMLElement);
        }
      },
      { rootMargin: APPROACH_MARGIN, threshold: 0 },
    );

    for (const section of sections) approach.observe(section);

    // A final short section on a very tall viewport may never reach the trigger line, so
    // reveal anything still hidden once the page cannot scroll any further.
    const revealRest = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
      if (!atBottom) return;
      for (const section of sections) {
        if (section.classList.contains("reveal-in")) continue;
        prepare(section);
        section.classList.add("reveal-in");
      }
    };
    window.addEventListener("scroll", revealRest, { passive: true });
    revealRest();

    return () => {
      disposed = true;
      approach.disconnect();
      reveal.disconnect();
      window.removeEventListener("scroll", revealRest);
    };
  }, []);

  return null;
}
