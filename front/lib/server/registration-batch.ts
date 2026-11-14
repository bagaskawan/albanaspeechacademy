import type { RegistrationBatch, RegistrationFormKind, VariantCopy } from "@/lib/registration";
import { pickAcceptingBatch } from "@/lib/registration";
import { formatSessionDate, formatTimeRange } from "@/lib/format";
import { readPrograms } from "./catalog";

export type RegistrationSelection =
  | { status: "ready"; batch: RegistrationBatch }
  | { status: "program"; program: { slug: string; title: string } }
  | { status: "loading" | "missing" | "failed" };

const FORM_KINDS: readonly RegistrationFormKind[] = ["series", "exclusive", "bnsp"];

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function asNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function asObjectArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    : [];
}

function toRegistrationBatch(
  program: Record<string, unknown>,
  batch: Record<string, unknown>,
): RegistrationBatch | null {
  const programName = asString(program.title);
  const programSlug = asString(program.slug);
  const batchSlug = asString(batch.slug);
  const batchName = asString(batch.title);
  const venueName = asString(batch.venue);
  const venueAddress = asString(batch.address);
  const formKindValue = asString(batch.form_kind);
  const formKind = FORM_KINDS.find((kind) => kind === formKindValue) ?? null;
  const priceIdr = asNumber(batch.price_idr);
  const feeDetails = asString(batch.fee_details);
  const normalPriceIdr = asNumber(batch.normal_price_idr);
  const dpValue = asNumber(batch.dp_percent);
  const dpPercent = dpValue !== null && Number.isInteger(dpValue) && dpValue >= 1 && dpValue <= 99 ? dpValue : null;

  // Admin-editable wording for the register form; missing fields fall back to
  // the form variant copy in the client.
  const formCopy: Partial<VariantCopy> = {};
  const priorExperienceLabel = asString(program.form_prior_experience);
  const goalLabel = asString(program.form_goal);
  const challengeLabel = asString(program.form_challenge);
  if (priorExperienceLabel) formCopy.priorExperienceLabel = priorExperienceLabel;
  if (goalLabel) formCopy.goalLabel = goalLabel;
  if (challengeLabel && formKind !== "bnsp") formCopy.challengeLabel = challengeLabel;

  const sessions = asObjectArray(batch.sessions)
    .map((session, index) => ({
      sequence: typeof session.sequence_no === "number" ? session.sequence_no : index + 1,
      startsAt: asString(session.starts_at),
      endsAt: asString(session.ends_at),
    }))
    .filter(
      (session): session is { sequence: number; startsAt: string; endsAt: string } =>
        session.startsAt !== null && session.endsAt !== null,
    )
    .sort((a, b) => a.sequence - b.sequence);

  if (
    !programName ||
    !programSlug ||
    !batchSlug ||
    !batchName ||
    !venueName ||
    !venueAddress ||
    !formKind ||
    priceIdr === null ||
    priceIdr < 0 ||
    sessions.length === 0
  ) {
    return null;
  }

  return {
    programSlug,
    batchSlug,
    programName,
    batchName,
    formatLabel: asString(program.format) ?? `${sessions.length} pertemuan`,
    timeLabel: formatTimeRange(sessions[0].startsAt, sessions[0].endsAt),
    sessions: sessions.map((session) => ({
      sequence: session.sequence,
      dateLabel: formatSessionDate(session.startsAt),
    })),
    venue: { name: venueName, address: venueAddress },
    formKind,
    formCopy,
    priceIdr,
    normalPriceIdr: normalPriceIdr !== null && normalPriceIdr > priceIdr ? normalPriceIdr : null,
    feeDetails,
    dpPercent,
  };
}

// Resolves the accepting batch for a program slug (batch is chosen server-side,
// not carried in the URL).
export async function readProgramRegistration(
  programSlug: string,
): Promise<RegistrationSelection> {
  try {
    const programs = await readPrograms();
    const program = asObjectArray(programs).find((item) => asString(item.slug) === programSlug);
    if (!program) return { status: "missing" };
    const title = asString(program.title) ?? programSlug;
    const batch = pickAcceptingBatch(asObjectArray(program.batches));
    const selection = batch ? toRegistrationBatch(program, batch) : null;
    if (selection) return { status: "ready", batch: selection };
    return { status: "program", program: { slug: programSlug, title } };
  } catch {
    return { status: "failed" };
  }
}
