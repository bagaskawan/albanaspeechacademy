import type { ReactNode } from "react";
import type { RegistrationBatch } from "@/lib/registration";

type BatchCardProps = {
  batch: RegistrationBatch;
  footer?: ReactNode;
  layout?: "stacked" | "wide";
};

export function BatchCard({ batch, footer, layout = "stacked" }: BatchCardProps) {
  const isWide = layout === "wide";

  return (
    <article className="overflow-hidden rounded-panel border border-rule bg-card">
      <div className="border-b border-rule p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">Batch pilihan</p>
        </div>
        <h2 className="mt-3 text-xl leading-[1.15] font-medium tracking-[-0.025em] md:text-2xl">
          {batch.programName} · {batch.batchName}
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          {batch.formatLabel}, {batch.timeLabel}.
        </p>
      </div>

      <ol
        className={`divide-y divide-rule ${isWide ? "md:grid md:grid-cols-4 md:divide-y-0" : ""}`}
      >
        {batch.sessions.map((session) => (
          <li
            key={session.sequence}
            className={`flex items-center gap-4 px-5 py-3.5 md:px-6 ${isWide ? "md:border-l md:border-rule md:first:border-l-0" : ""
              }`}
          >
            <p className="flex-1 font-semibold">
              {session.dateLabel}
            </p>
          </li>
        ))}
      </ol>

      <div className="border-t border-rule p-5 md:p-6">
        <p className="eyebrow">Tempat</p>
        <p className="mt-2.5 text-lg font-semibold tracking-[-0.015em]">
          {batch.venue.name}
        </p>
        <p className="mt-1 text-sm text-muted">{batch.venue.address}</p>
      </div>

      {footer ? (
        <div className="border-t border-rule bg-surface p-5 md:p-6">{footer}</div>
      ) : null}
    </article>
  );
}
