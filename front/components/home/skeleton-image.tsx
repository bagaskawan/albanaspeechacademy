"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function SkeletonImage({ className = "", onLoad, onError, alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-pulse bg-[var(--tone-tile)]"
        />
      ) : null}
      <Image
        {...props}
        alt={alt}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoaded(true);
          onError?.(event);
        }}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
