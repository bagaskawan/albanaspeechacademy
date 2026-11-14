"use client";

import { useEffect, useRef } from "react";
import { countDurationMs, countUpText } from "@/lib/motion";

// All figures in a section count together, so each one watches the section rather than
// its own line. They start once the section has climbed well into view — earlier than
// its middle, but with every figure on screen so none finishes out of sight.
const SECTION_TRIGGER_FRACTION = 0.3;
const SECTION_TRIGGER_MARGIN = `0px 0px ${(SECTION_TRIGGER_FRACTION - 1) * 100}% 0px`;

// Counts a figure up from zero, in step with the other figures in its section and the
// section's bars. The final value is what renders on the server and under reduced
// motion, so the figure is never missing or wrong; otherwise it holds at zero until
// the section arrives.
export function CountUp({
  className,
  value,
  suffix = "",
}: {
  className?: string;
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = node.closest("section") ?? node;
    const arrived = () =>
      target.getBoundingClientRect().top < window.innerHeight * SECTION_TRIGGER_FRACTION;

    // Arm the section's bars at zero so they draw with the figures, not before.
    target.classList.add("is-count-armed");
    node.textContent = countUpText(value, 0, suffix);

    let frame = 0;
    const run = () => {
      target.classList.add("is-counted");
      const duration = countDurationMs(value);
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = (now - startedAt) / duration;
        node.textContent = countUpText(value, progress, suffix);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    if (arrived()) {
      run();
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          run();
        }
      },
      { rootMargin: SECTION_TRIGGER_MARGIN, threshold: 0 },
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, suffix]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
