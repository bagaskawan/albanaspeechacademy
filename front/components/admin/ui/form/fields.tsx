import Link from "next/link";

// admin-ui-patterns §7.1–§7.2b. Server-safe (no hooks): usable in pages and client forms alike.

const columns = { sm: "sm:grid-cols-2", md: "md:grid-cols-2" } as const;
const spans = {
  sm: { full: "sm:col-span-2", half: "", narrow: "sm:col-span-2" },
  md: { full: "md:col-span-2", half: "", narrow: "md:col-span-2" },
} as const;

/**
 * `columns={1}`: always one column (modal sm/md). `columns={2}`: two from 640 px (`sm`, modal lg)
 * or 768 px (`md`, pages).
 */
export function FieldGrid({ columns: count = 2, breakpoint = "sm", children }: { columns?: 1 | 2; breakpoint?: keyof typeof columns; children: React.ReactNode }) {
  return <div className={`grid gap-x-4 gap-y-5 ${count === 2 ? columns[breakpoint] : ""}`}>{children}</div>;
}

export function Field({ label, htmlFor, required = false, hint, error, span = "full", breakpoint = "sm", children }: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  /** full: whole row · half: paired with another half · narrow: short numbers (160 px) */
  span?: "full" | "half" | "narrow";
  /** Must match the parent FieldGrid breakpoint. */
  breakpoint?: keyof typeof columns;
  children: React.ReactNode;
}) {
  return <div className={`min-w-0 ${spans[breakpoint][span]}`}>
    <label htmlFor={htmlFor} className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary">
      {label}{required && <span aria-hidden="true" className="ml-0.5 text-admin-danger">*</span>}
    </label>
    <div className={span === "narrow" ? "max-w-[160px]" : undefined}>{children}</div>
    {error
      ? <p role="alert" className="mt-1.5 min-h-5 text-[12px] text-admin-danger">{error}</p>
      : hint && <p className="mt-1.5 text-[12px] text-admin-text-secondary">{hint}</p>}
  </div>;
}

/** Numbered section of a page form: number badge, title, hairline below. */
export function FormSection({ number, title, description, children }: { number: number; title: string; description?: string; children: React.ReactNode }) {
  return <section className="border-t border-admin-line pt-8 first:border-0 first:pt-0">
    <header className="mb-6 flex items-start gap-3">
      <span aria-hidden="true" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-admin-line-strong text-[13px] font-semibold">{number}</span>
      <div>
        <h2 className="text-[15px] font-semibold leading-7 text-admin-ink">{title}</h2>
        {description && <p className="text-[13px] text-admin-text-secondary">{description}</p>}
      </div>
    </header>
    {children}
  </section>;
}

const pageWidths = { single: "max-w-[760px]", double: "max-w-[960px]" } as const;
const pill = "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink max-sm:w-full";

/** Page form card (T2): white card, numbered sections, Batal + primary action bottom right. */
export function FormPage({ width = "single", cancelHref, submitLabel, pending = false, children, ...form }: {
  width?: keyof typeof pageWidths;
  cancelHref: string;
  submitLabel: string;
  pending?: boolean;
  children: React.ReactNode;
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "children" | "className">) {
  return <form {...form} className={`admin-form-plain ${pageWidths[width]} rounded-[var(--admin-radius-card)] border border-admin-line-strong bg-admin-canvas p-[var(--admin-space-card)]`}>
    <div className="space-y-8">{children}</div>
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-admin-line pt-6 sm:flex-row sm:justify-end">
      <Link href={cancelHref} className={`${pill} border border-admin-line-strong text-admin-ink hover:bg-admin-surface`}>Batal</Link>
      <button type="submit" disabled={pending} className={`${pill} bg-admin-ink text-admin-on-ink hover:bg-admin-ink-soft disabled:opacity-60`}>{pending ? "Menyimpan…" : submitLabel}</button>
    </div>
  </form>;
}
