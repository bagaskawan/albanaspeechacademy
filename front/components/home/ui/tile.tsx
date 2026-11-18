import type { ReactNode } from "react";

type TileTone = "plain" | "tile" | "sun" | "night";

const toneClasses: Record<TileTone, string> = {
  plain: "border border-[var(--tone-rule)] bg-[var(--tone-bg)] text-[var(--tone-ink)]",
  tile: "bg-[var(--tone-tile)] text-[var(--tone-ink)]",
  sun: "bg-[var(--tone-sun)] text-[var(--tone-on-sun)]",
  night: "tone-night bg-[var(--tone-bg)] text-[var(--tone-ink)]",
};

export function Tile({
  tone = "tile",
  className = "",
  children,
}: {
  tone?: TileTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-xs p-4 sm:p-6 ${toneClasses[tone]} ${className}`}>
      {children}
    </div>
  );
}
