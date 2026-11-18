import { Tile } from "@/components/home/ui/tile";
import { formatRupiah } from "@/lib/format";
import { feeNote, type RegistrationBatch } from "@/lib/registration";

function venueLabel(venue: RegistrationBatch["venue"]) {
  const name = venue.name.trim();
  const address = venue.address.trim();
  const nameLower = name.toLowerCase();
  const addressLower = address.toLowerCase();
  if (!address || addressLower === nameLower) return name;
  if (nameLower.includes(addressLower)) return name;
  if (addressLower.includes(nameLower)) return address;
  return `${name} · ${address}`;
}

export function RegistrationOverview({ batch }: { batch: RegistrationBatch }) {
  const normalPriceIdr =
    batch.normalPriceIdr !== null && batch.normalPriceIdr > batch.priceIdr ? batch.normalPriceIdr : null;
  const note = feeNote(batch.feeDetails);

  return (
    <Tile tone="tile" className="border border-[var(--tone-rule)]">
      <section aria-label="Batch pilihan">
        <p className="eyebrow text-[var(--tone-muted)]">Batch pilihan</p>
        <h2 className="type-title mt-1">
          {batch.programName} · {batch.batchName}
        </h2>
        <p className="type-small mt-1 text-[var(--tone-muted)]">
          {batch.formatLabel} · {batch.timeLabel}
        </p>
        <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="eyebrow text-[var(--tone-muted)]">Jadwal</dt>
            <dd className="type-small mt-1">
              <ol className="grid gap-1 tabular-nums">
                {batch.sessions.map((session) => (
                  <li key={session.sequence}>{session.dateLabel}</li>
                ))}
              </ol>
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-[var(--tone-muted)]">Tempat</dt>
            <dd className="type-small mt-1">{venueLabel(batch.venue)}</dd>
          </div>
          <div className="border-t border-[var(--tone-rule)] pt-4 sm:col-span-2">
            <dt className="eyebrow text-[var(--tone-muted)]">Biaya</dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="type-title tabular-nums">{formatRupiah(batch.priceIdr)}</span>
              {normalPriceIdr !== null ? (
                <span className="type-small text-[var(--tone-muted)]">
                  Harga normal <s className="tabular-nums">{formatRupiah(normalPriceIdr)}</s>
                </span>
              ) : null}
            </dd>
            {note ? <dd className="type-small mt-1 text-[var(--tone-muted)]">{note}</dd> : null}
          </div>
        </dl>
      </section>
    </Tile>
  );
}
