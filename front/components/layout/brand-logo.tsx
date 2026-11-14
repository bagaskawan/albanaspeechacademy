import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  src?: string;
};

export function BrandLogo({
  className = "",
  imageClassName = "scale-[1.8]",
  src = "/images/alan-albana-transparent.png",
}: BrandLogoProps) {
  return (
    <span className={`relative block aspect-[120/46] overflow-hidden ${className}`}>
      <Image
        alt="Albana Speech Academy"
        className={`object-contain ${imageClassName}`}
        fill
        priority
        sizes="100px"
        src={src}
      />
    </span>
  );
}
