"use client";

import { useState } from "react";
import { SkeletonImage } from "./skeleton-image";

const FALLBACK_ALAN = "/images/alan-albana-profile-blue-background.png";

export function AboutPortrait({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <SkeletonImage
      src={imgSrc}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 30vw, 60vw"
      onError={() => {
        if (imgSrc !== FALLBACK_ALAN) setImgSrc(FALLBACK_ALAN);
      }}
      className="object-cover object-[center_25%]"
    />
  );
}
