import { BrandLogo } from "@/components/layout/brand-logo";

interface PageLoadingProps {
  label?: string;
  fullScreen?: boolean;
}

export function PageLoading({
  label = "Memuat halaman...",
  fullScreen = true,
}: PageLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`tone-canvas flex w-full flex-col items-center justify-center px-6 text-[var(--tone-ink)] select-none ${
        fullScreen ? "min-h-svh bg-[var(--tone-bg)]" : "min-h-[70svh]"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-44 motion-safe:animate-pulse sm:w-52">
          <span
            className="academy-hero-logo-blue block aspect-[120/46] w-full dark:hidden"
            role="img"
            aria-label="Albana Speech Academy"
          />
          <BrandLogo
            src="/logo-white.png"
            imageClassName="object-contain"
            sizes="208px"
            className="hidden w-full dark:block"
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="h-0.5 w-36 overflow-hidden bg-[var(--tone-rule)]">
            <div className="h-full w-1/2 animate-[loading-bar_1.2s_ease-in-out_infinite] bg-[var(--tone-accent)]" />
          </div>
          <p className="eyebrow text-[var(--tone-muted)]">{label}</p>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
