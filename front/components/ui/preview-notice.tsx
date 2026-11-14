import type { ReactNode } from "react";

type PreviewNoticeProps = {
  children: ReactNode;
  className?: string;
};

/** Small rectangular label marking proposal/preview material, not published fact. */
export function PreviewNotice({ children, className = "" }: PreviewNoticeProps) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-control border border-rule bg-card px-2.5 py-1 text-[0.6875rem] tracking-[0.08em] text-muted uppercase ${className}`.trim()}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 bg-highlight-strong" />
      {children}
    </p>
  );
}
