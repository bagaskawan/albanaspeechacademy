// Shared admin data table (admin-ui-patterns §8.3). Styling lives in `.admin-table` (globals.css),
// so modules write plain <thead>/<th>/<td> and only add alignment or content classes.

export function DataTable({ caption, stackOnMobile = false, minWidth = 720, children }: {
  caption: string;
  /** < 768 px: rows become cards; every <td> then needs a `data-label`. */
  stackOnMobile?: boolean;
  minWidth?: number;
  children: React.ReactNode;
}) {
  return <div className="admin-table-wrap">
    <table className={`admin-table${stackOnMobile ? " admin-table-stack" : ""}`} style={{ minWidth: stackOnMobile ? undefined : minWidth }}>
      <caption className="sr-only">{caption}</caption>
      {children}
    </table>
  </div>;
}

const tones = {
  mint: "bg-admin-mint-soft text-admin-mint-ink [--dot:var(--admin-mint-dot)]",
  peach: "bg-admin-peach-soft text-admin-peach-ink [--dot:var(--admin-peach-dot)]",
  rose: "bg-admin-rose-soft text-admin-rose-ink [--dot:var(--admin-rose-dot)]",
  lilac: "bg-admin-lilac-soft text-admin-lilac-ink [--dot:var(--admin-lilac-dot)]",
  neutral: "bg-admin-surface-muted text-admin-text-secondary [--dot:var(--admin-text-faint)]",
} as const;

/** Status chip (§2.1): sentence case, 6 px dot, one tone per meaning. */
export function StatusChip({ tone, children }: { tone: keyof typeof tones; children: React.ReactNode }) {
  return <span className={`inline-flex h-[26px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium ${tones[tone]}`}>
    <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--dot)]" />
    {children}
  </span>;
}

/** 36 px round icon action for table rows; the label is the accessible name and the tooltip. */
export const rowActionClass = "inline-flex size-9 items-center justify-center rounded-full text-admin-ink transition-colors hover:bg-admin-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink disabled:opacity-50";
export const rowDangerActionClass = rowActionClass.replace("text-admin-ink", "text-admin-danger").replace("hover:bg-admin-surface-muted", "hover:bg-admin-rose-soft");
