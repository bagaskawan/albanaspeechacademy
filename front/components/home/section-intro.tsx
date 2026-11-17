import type { ReactNode } from "react";

type SectionIntroProps = {
  eyebrow: string;
  title: ReactNode;
  titleMuted?: ReactNode;
  titleId: string;
  description?: string;
  layout?: "split" | "stack";
  className?: string;
};

export function SectionIntro({
  eyebrow,
  title,
  titleMuted,
  titleId,
  description,
  layout = "split",
  className = "",
}: SectionIntroProps) {
  const split = layout === "split";
  return (
    <div className={`${split ? "lg:grid lg:grid-cols-12 lg:gap-x-6" : ""} ${className}`}>
      <p className={`eyebrow ${split ? "lg:col-span-12" : ""}`}>{eyebrow}</p>
      <h2
        id={titleId}
        data-motion="heading"
        className={`type-display mt-3 text-balance ${split ? "lg:col-span-7" : "max-w-[24ch]"}`}
      >
        {title}
        {titleMuted ? <span className="text-[var(--tone-muted,var(--color-academy-muted))]"> {titleMuted}</span> : null}
      </h2>
      {description ? (
        <p
          data-motion="rise"
          className={`type-lead mt-3 max-w-[32em] text-[var(--tone-muted,var(--color-academy-muted))] ${split ? "lg:col-span-4 lg:col-start-9 lg:self-end" : ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
