import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";

/** Baris identitas halaman pendaftaran: logo adaptif tema dengan garis pembatas tipis. */
export function RegisterBrandBar() {
  return (
    <div className="mb-2 border-b border-[var(--tone-rule)] pb-6">
      <Link
        href="/"
        aria-label="Albana Speech Academy, beranda"
        className="inline-flex min-h-11 items-center"
      >
        <span
          className="academy-hero-logo-blue block aspect-[120/46] h-8 sm:h-9 dark:hidden"
          role="img"
          aria-label="Albana Speech Academy"
        />
        <BrandLogo
          src="/logo-white.png"
          imageClassName="object-contain"
          sizes="96px"
          className="hidden h-8 sm:h-9 dark:block"
        />
      </Link>
    </div>
  );
}
