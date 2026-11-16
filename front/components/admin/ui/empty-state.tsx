import { Inbox, SearchX } from "lucide-react";

/**
 * Empty list (admin-ui-patterns §9.3): centred in the content area with an icon, one line of title
 * and one of guidance. `searching` switches to the "no results" variant.
 */
export function EmptyState({ title, description, searching = false, action }: {
  title: string;
  description?: React.ReactNode;
  searching?: boolean;
  action?: React.ReactNode;
}) {
  const Icon = searching ? SearchX : Inbox;
  return <div role="status" className="flex min-h-[min(420px,55dvh)] flex-col items-center justify-center rounded-[var(--admin-radius-card)] border border-dashed border-admin-line-strong px-6 py-12 text-center">
    <span className="inline-flex size-14 items-center justify-center rounded-full bg-admin-surface text-admin-text-secondary">
      <Icon aria-hidden="true" size={24} strokeWidth={1.5} />
    </span>
    <p className="mt-4 text-[16px] font-medium text-admin-ink">{title}</p>
    {description && <p className="mt-1 max-w-[40ch] text-[14px] leading-[1.5] text-admin-text-secondary">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>;
}
