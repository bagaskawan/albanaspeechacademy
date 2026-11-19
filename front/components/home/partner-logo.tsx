"use client";

import Image from "next/image";
import { useState } from "react";

export function PartnerLogo({ src, alt }: { src: string; alt: string }) {
  const [portrait, setPortrait] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      width={160}
      height={80}
      onLoad={(event) => {
        const img = event.currentTarget;
        if (img.naturalWidth && img.naturalHeight && img.naturalHeight >= img.naturalWidth * 0.9) {
          setPortrait(true);
        }
      }}
      className={`h-auto w-auto max-w-full object-contain opacity-85 brightness-0 invert transition [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-100 ${
        portrait ? "max-h-16 sm:max-h-20" : "max-h-10 sm:max-h-11"
      }`}
    />
  );
}
