import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  src?: string;
  sizes?: string;
  priority?: boolean;
};

export function BrandLogo({
  className = "",
  imageClassName = "scale-[1.8]",
  src = "/images/alan-albana-transparent.png",
  sizes = "100px",
  priority = true,
}: BrandLogoProps) {
  return (
    <span className={`relative block aspect-[120/46] overflow-hidden ${className}`}>
      <Image
        alt="Albana Speech Academy"
        className={`object-contain ${imageClassName}`}
        fill
        priority={priority}
        sizes={sizes}
        src={src}
      />
    </span>
  );
}
