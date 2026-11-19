import Image, { type ImageProps } from "next/image";

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
  ...props
}: ImageProps) {
  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized={unoptimized ?? shouldBypassOptimizer(src)}
      placeholder={blurDataURL ? "blur" : placeholder}
      blurDataURL={blurDataURL}
      className={className}
    />
  );
}
