"use client";

import { useState } from "react";

export function ArticleInlineImage({
  src,
  alt,
  width,
  height,
  eager = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex w-full items-center justify-center bg-[#F3F7FC] px-4 py-8 text-center text-sm text-[#47607D] md:rounded"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <span>{alt || "Gambar artikel tidak dapat dimuat."}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className="mx-auto block w-full bg-[#F3F7FC] object-contain md:max-h-[80vh] md:rounded"
      style={{ aspectRatio: `${width} / ${height}`, height: "auto", width: "100%" }}
    />
  );
}
