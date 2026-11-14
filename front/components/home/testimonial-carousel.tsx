"use client";

import { useEffect, useRef, useState } from "react";

export type TestimonialPreview = {
  id: string;
  quote: string;
  name: string;
  program: string;
  initials: string;
};

type TestimonialCarouselProps = {
  testimonials: readonly TestimonialPreview[];
};

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const updateScrollState = () => {
      setCanScrollPrev(list.scrollLeft > 1);
      setCanScrollNext(list.scrollLeft + list.clientWidth < list.scrollWidth - 1);
    };

    updateScrollState();
    list.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(list);

    return () => {
      list.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;

    const firstCard = list.querySelector("li");
    const gap = 16;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : list.clientWidth;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    list.scrollBy({
      left: direction * distance,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="mt-6">
      <ul
        id="testimonial-list"
        ref={listRef}
        aria-label="Contoh testimoni peserta"
        className="flex snap-x snap-mandatory list-none gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((testimonial) => (
          <li key={testimonial.id} className="w-[min(20rem,85vw)] shrink-0 snap-start sm:w-[22rem]">
            <article className="flex h-full flex-col rounded-card border border-rule bg-card p-6">
              <span aria-hidden="true" className="text-3xl leading-none text-highlight-strong">
                &ldquo;
              </span>
              <p className="mt-3 flex-1 leading-[1.6] text-muted">{testimonial.quote}</p>
              <div className="mt-6 flex items-center gap-3 border-t border-rule pt-4">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-highlight text-sm font-semibold text-accent-strong"
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="font-display font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted">{testimonial.program}</p>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          className="button-secondary size-11 cursor-pointer p-0 text-lg hover:bg-highlight disabled:cursor-not-allowed disabled:border-rule disabled:bg-card disabled:text-control"
          aria-label="Testimoni sebelumnya"
          aria-controls="testimonial-list"
          onClick={() => scroll(-1)}
          disabled={!canScrollPrev}
        >
          <span aria-hidden="true">&larr;</span>
        </button>
        <button
          type="button"
          className="button-secondary size-11 cursor-pointer p-0 text-lg hover:bg-highlight disabled:cursor-not-allowed disabled:border-rule disabled:bg-card disabled:text-control"
          aria-label="Testimoni berikutnya"
          aria-controls="testimonial-list"
          onClick={() => scroll(1)}
          disabled={!canScrollNext}
        >
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
