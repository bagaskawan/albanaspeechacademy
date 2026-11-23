"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const YOUTUBE_FALLBACKS = ["maxresdefault.jpg", "sddefault.jpg", "hqdefault.jpg"] as const;
const YOUTUBE_MAXRES_RE = /^(https:\/\/i\.ytimg\.com\/vi\/[^/]+\/)maxresdefault\.jpg$/;

function shouldBypassOptimizer(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return false;
  return src.startsWith("/api/media/") || src.includes(".supabase.co/") || src.includes("i.ytimg.com/");
}

export function SkeletonImage({
  className = "",
  alt,
  unoptimized,
  src,
  placeholder,
  blurDataURL,
  onError,
  ...props
}: ImageProps) {
  const [ytFallback, setYtFallback] = useState<{ src: ImageProps["src"]; index: number }>({
    src,
    index: 0,
  });
  const ytFallbackIndex = ytFallback.src === src ? ytFallback.index : 0;

  const ytMatch = typeof src === "string" ? YOUTUBE_MAXRES_RE.exec(src) : null;
  const resolvedSrc =
    ytMatch && ytFallbackIndex > 0 && ytFallbackIndex < YOUTUBE_FALLBACKS.length
      ? `${ytMatch[1]}${YOUTUBE_FALLBACKS[ytFallbackIndex]}`
      : src;

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      unoptimized={unoptimized ?? shouldBypassOptimizer(resolvedSrc)}
      placeholder={blurDataURL ? "blur" : placeholder}
      blurDataURL={blurDataURL}
      className={className}
      onError={(event) => {
        if (ytMatch && ytFallbackIndex + 1 < YOUTUBE_FALLBACKS.length) {
          setYtFallback({ src, index: ytFallbackIndex + 1 });
          return;
        }
        onError?.(event);
      }}
    />
  );
}
