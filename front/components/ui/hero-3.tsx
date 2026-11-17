"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { m, useReducedMotion } from "motion/react";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { cn } from "@/lib/utils";

type AnimatedMarqueeHeroProps = {
  tagline: string;
  title: ReactNode;
  description: string;
  ctaText: string;
  ctaHref: string;
  images: readonly string[];
  className?: string;
};

export function AnimatedMarqueeHero(props: AnimatedMarqueeHeroProps) {
  return <MotionProvider><HeroContent {...props} /></MotionProvider>;
}

function HeroContent({ tagline, title, description, ctaText, ctaHref, images, className }: AnimatedMarqueeHeroProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section id="beranda" className={cn("academy-home-hero", className)} aria-labelledby="hero-title">
      <div className="academy-hero-content">
        <p className="academy-hero-tagline">{tagline}</p>
        <h1 id="hero-title" className="academy-hero-title">{title}</h1>
        <p className="academy-hero-description">{description}</p>
        <m.a className="academy-hero-cta" href={ctaHref} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {ctaText}
        </m.a>
      </div>
      <figure className="academy-hero-gallery">
        <div className="academy-hero-marquee" aria-hidden="true">
          <m.div
            className="academy-hero-track"
            animate={reducedMotion ? undefined : { x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          >
            {[0, 1].map((copy) => (
              <div className="academy-hero-image-group" key={copy}>
                {images.map((src, index) => (
                  <div className="academy-hero-image" key={`${copy}-${src}`} style={{ rotate: `${index % 2 ? 3 : -3}deg` }}>
                    <Image src={src} alt="" fill sizes="(min-width: 768px) 172px, 128px" loading={copy === 0 ? "eager" : "lazy"} className="object-cover" />
                  </div>
                ))}
              </div>
            ))}
          </m.div>
        </div>
        <figcaption>Contoh visual — bukan dokumentasi kelas Albana</figcaption>
      </figure>
    </section>
  );
}
