"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeTestimonial } from "@/lib/home-data";

function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

/** Slider manual (tanpa putar otomatis): geser, tombol, atau panah papan tuts. */
export function TestimonialSlider({ testimonials }: { testimonials: HomeTestimonial[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(testimonials.length <= 1);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 4);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  function step(direction: 1 | -1) {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + 16), behavior: reduced ? "auto" : "smooth" });
  }

  const button =
    "inline-flex size-11 cursor-pointer items-center justify-center rounded-xs border border-[var(--tone-ink)] transition-colors hover:bg-[var(--tone-ink)] hover:text-[var(--tone-bg)] disabled:cursor-not-allowed disabled:border-[var(--tone-rule)] disabled:text-[var(--tone-muted)] disabled:hover:bg-transparent";

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Cerita peserta" className="flex flex-col gap-6">
      <ul
        ref={trackRef}
        onScroll={update}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
        }}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-[var(--tone-accent)] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((item, index) => (
          <li
            key={item.id}
            aria-roledescription="slide"
            aria-label={`${index + 1} dari ${testimonials.length}`}
            className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
          >
            <figure className="flex h-full flex-col justify-between gap-10 rounded-xs bg-[var(--tone-tile)] p-6 sm:p-8">
              <div className="flex flex-col gap-4">
                <span aria-hidden="true" className="font-serif text-6xl leading-none text-[var(--tone-accent)]">“</span>
                <blockquote className="type-title text-pretty">{item.quote}</blockquote>
              </div>
              <figcaption className="flex items-center gap-4 border-t border-[var(--tone-rule)] pt-4">
                {item.photoUrl ? (
                  <Image
                    src={item.photoUrl}
                    alt={item.attribution}
                    width={44}
                    height={44}
                    className="size-11 shrink-0 aspect-square rounded-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true" className="type-small flex size-11 shrink-0 aspect-square items-center justify-center rounded-full bg-[var(--tone-sun)] font-semibold text-[var(--tone-on-sun)]">
                    {initials(item.attribution)}
                  </span>
                )}
                <span>
                  <span className="type-small block font-semibold">{item.attribution}</span>
                  {item.roleLabel ? <span className="type-small block text-[var(--tone-muted)]">{item.roleLabel}</span> : null}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {testimonials.length > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <button type="button" className={button} onClick={() => step(-1)} disabled={atStart} aria-label="Cerita sebelumnya">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button type="button" className={button} onClick={() => step(1)} disabled={atEnd} aria-label="Cerita berikutnya">
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
