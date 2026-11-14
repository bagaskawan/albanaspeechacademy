import { formatRupiah } from "@/lib/format";
import { feeNote, type RegistrationBatch } from "@/lib/registration";

// Online batches often repeat the address in the name; show one when one
// already contains the other.
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
    <section className="mt-9 border-y border-rule bg-surface px-4 py-5 sm:px-6" aria-label="Batch pilihan">
      <p className="eyebrow">Batch pilihan</p>
      <h2 className="mt-1 text-lg font-semibold leading-snug text-balance">{batch.programName} · {batch.batchName}</h2>
      <p className="mt-1 text-sm text-muted">{batch.formatLabel} · {batch.timeLabel}</p>
      <dl className="mt-5 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="eyebrow">Jadwal</dt>
          <dd className="mt-1.5">
            <ol className="grid gap-1 tabular-nums">
              {batch.sessions.map((session) => (
                <li key={session.sequence}>{session.dateLabel}</li>
              ))}
            </ol>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Tempat</dt>
          <dd className="mt-1.5">{venueLabel(batch.venue)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="eyebrow">Biaya</dt>
          <dd className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-lg font-semibold tabular-nums">{formatRupiah(batch.priceIdr)}</span>
            {normalPriceIdr !== null ? (
              <span className="text-muted">
                Harga normal <s className="tabular-nums">{formatRupiah(normalPriceIdr)}</s>
              </span>
            ) : null}
          </dd>
          {note ? <dd className="mt-1 text-muted">{note}</dd> : null}
        </div>
      </dl>
    </section>
  );
}
