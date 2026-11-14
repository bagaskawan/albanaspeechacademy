import { isSlug, parseRegistration } from "./registration-input.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseAcademySubmission(input: unknown) {
  const registration = parseRegistration(input);
  if (!registration || !input || typeof input !== "object" || Array.isArray(input)) return null;
  const fields = input as Record<string, unknown>;
  if (typeof fields.idempotencyKey !== "string" || !UUID.test(fields.idempotencyKey)) return null;
  const offerSlug = fields.offerSlug ?? null;
  const secondaryBatchSlug = fields.secondaryBatchSlug ?? null;
  if ((offerSlug === null) !== (secondaryBatchSlug === null)) return null;
  if (offerSlug !== null && (!isSlug(offerSlug) || !isSlug(secondaryBatchSlug))) return null;
  return {
    primaryBatchSlug: registration.batch,
    secondaryBatchSlug: secondaryBatchSlug as string | null,
    offerSlug: offerSlug as string | null,
    expectedPriceIdr: registration.participant.priceIdr,
    expectedDpPercent: registration.participant.dpPercent,
    formKind: registration.participant.formKind,
    paymentMethod: registration.participant.paymentMethod,
    fullName: registration.participant.fullName,
    email: registration.participant.email,
    whatsapp: registration.participant.whatsapp,
    answers: registration.participant.answers,
    idempotencyKey: fields.idempotencyKey,
  };
}
