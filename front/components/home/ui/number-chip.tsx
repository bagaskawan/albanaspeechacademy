export function NumberChip({ n }: { n: number }) {
  return (
    <span className="type-micro inline-flex h-5 items-center rounded-xs bg-[var(--tone-sun)] px-1.5 text-[var(--tone-on-sun)]">
      {String(n).padStart(2, "0")}
    </span>
  );
}
