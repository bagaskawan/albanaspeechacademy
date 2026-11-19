import type { ReactNode } from "react";
import { MoreLink } from "./ui/more-link";

type SectionIntroProps = {
  /** Penanda bab, mis. "02 · Program". */
  eyebrow: string;
  title: ReactNode;
  titleId: string;
  description?: ReactNode;
  action?: { href: string; label: string };
  /** split: judul kiri, cerita kanan (bawaan). center: semuanya di tengah. */
  align?: "split" | "center";
  className?: string;
};

export function SectionIntro({
  eyebrow,
  title,
  titleId,
  description,
  action,
  align = "split",
  className = "",
}: SectionIntroProps) {
  if (align === "center") {
    return (
      <div className={`mx-auto flex max-w-3xl flex-col items-center gap-6 text-center ${className}`}>
        <p className="type-label text-[var(--tone-muted)]">{eyebrow}</p>
        <h2 id={titleId} data-motion="heading" className="type-display text-balance">
          {title}
        </h2>
        {description ? (
          <p data-motion="rise" className="type-lead max-w-[36em] text-[var(--tone-muted)] text-pretty">
            {description}
          </p>
        ) : null}
        {action ? <MoreLink href={action.href}>{action.label}</MoreLink> : null}
      </div>
    );
  }

  return (
    <div className={`home-grid gap-y-6 ${className}`}>
      <div className="col-span-4 flex flex-col gap-4 sm:col-span-8 lg:col-span-7">
        <p className="type-label text-[var(--tone-muted)]">{eyebrow}</p>
        <h2 id={titleId} data-motion="heading" className="type-display max-w-[20ch] text-balance">
          {title}
        </h2>
      </div>

      {description || action ? (
        <div className="col-span-4 flex flex-col items-start gap-4 self-end sm:col-span-6 lg:col-span-4 lg:col-start-9">
          {description ? (
            <p data-motion="rise" className="type-body max-w-[42ch] text-[var(--tone-muted)] text-pretty">
              {description}
            </p>
          ) : null}
          {action ? <MoreLink href={action.href}>{action.label}</MoreLink> : null}
        </div>
      ) : null}
    </div>
  );
}
