import { NumberChip } from "./number-chip";

export function StatTile({
  n,
  value,
  label,
}: {
  n: number;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <NumberChip n={n} />
      <p className="type-title tabular-nums text-[var(--tone-ink)]">{value}</p>
      <p className="type-small text-[var(--tone-muted)]">{label}</p>
    </div>
  );
}
