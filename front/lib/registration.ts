export type BatchSession = {
  sequence: number;
  dateLabel: string;
};

export type RegistrationFormKind = "series" | "exclusive" | "bnsp";

// Question wording that differs per program. Programs added from admin may
// override these; empty fields fall back to the form variant below.
export type VariantCopy = {
  priorExperienceLabel: string;
  goalLabel: string;
  challengeLabel: string | null;
};

export type RegistrationFormCopy = VariantCopy & {
  attendanceLabel: string;
};

export type RegistrationBatch = {
  programSlug: string;
  batchSlug: string;
  programName: string;
  batchName: string;
  formatLabel: string;
  timeLabel: string;
  sessions: readonly BatchSession[];
  venue: {
    name: string;
    address: string;
  };
  formKind: RegistrationFormKind;
  formCopy: Partial<VariantCopy> | null;
  priceIdr: number;
  normalPriceIdr: number | null;
  feeDetails: string | null;
  dpPercent: number | null;
};

// A batch's free-text fee details often repeat the price the overview already
// shows. Keep only the parts that add information (inclusions, terms).
const PRICE_ONLY = /^(?:harga\s+(?:normal|promo|khusus|berlaku)\s*:?\s*|biaya\s*:?\s*)?rp\s*[\d.,\s]+$/i;

export function feeNote(feeDetails: string | null): string | null {
  if (!feeDetails) return null;
  const parts = feeDetails
    .split(/[;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !PRICE_ONLY.test(part.replace(/\s+/g, " ")));
  return parts.length ? parts.join("; ") : null;
}

export const ACCEPTING_STATUSES = new Set(["open", "running_open"]);

// A batch is accepting when the API computed the flag; fall back to status when
// the flag is absent (older catalog shapes).
export function isAcceptingBatch(batch: Record<string, unknown>): boolean {
  if (typeof batch.accepting_registrations === "boolean") return batch.accepting_registrations;
  if (typeof batch.registration_open === "boolean") {
    return batch.registration_open && firstSessionStart(batch) > Date.now();
  }
  return typeof batch.status === "string" && ACCEPTING_STATUSES.has(batch.status);
}

function firstSessionStart(batch: Record<string, unknown>): number {
  const sessions = Array.isArray(batch.sessions) ? batch.sessions : [];
  const starts = sessions
    .map((session) =>
      session && typeof session === "object"
        ? (session as Record<string, unknown>).starts_at
        : null,
    )
    .filter((value): value is string => typeof value === "string")
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value));
  return starts.length ? Math.min(...starts) : Number.POSITIVE_INFINITY;
}

// Picks the accepting batch whose first session starts soonest; ties keep the
// first seen. Returns null when none accept.
export function pickAcceptingBatch(
  batches: Record<string, unknown>[],
): Record<string, unknown> | null {
  let best: Record<string, unknown> | null = null;
  let bestStart = Number.POSITIVE_INFINITY;
  for (const batch of batches) {
    if (!isAcceptingBatch(batch)) continue;
    const start = firstSessionStart(batch);
    if (start < bestStart) {
      best = batch;
      bestStart = start;
    }
  }
  return best;
}
