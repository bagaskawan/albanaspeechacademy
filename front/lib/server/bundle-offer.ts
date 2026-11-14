import "server-only";

import type { RegistrationBatch } from "@/lib/registration";
import { academyRequest } from "./academy-api";
import { readProgramRegistration } from "./registration-batch";

export type BundleChoice = {
  slug: string;
  title: string;
  priceIdr: number;
  dpPercent: number | null;
  primary: RegistrationBatch;
  secondary: RegistrationBatch;
};

export async function readBundleChoice(current: RegistrationBatch): Promise<BundleChoice | null> {
  const rows = await academyRequest("bundle_offers?select=slug,title,speaker_program_slug,certification_program_slug,price_idr,dp_percent&active=eq.true&order=updated_at.desc&limit=10");
  if (!Array.isArray(rows)) return null;
  for (const raw of rows) {
    if (!raw || typeof raw !== "object") continue;
    const offer = raw as Record<string, unknown>;
    if (current.programSlug !== offer.speaker_program_slug && current.programSlug !== offer.certification_program_slug) continue;
    if (typeof offer.speaker_program_slug !== "string" || typeof offer.certification_program_slug !== "string" ||
      typeof offer.slug !== "string" || typeof offer.title !== "string") continue;
    const price = Number(offer.price_idr);
    const percent = offer.dp_percent === null ? null : Number(offer.dp_percent);
    if (!Number.isSafeInteger(price) || price <= 0 || percent !== null && (!Number.isInteger(percent) || percent < 1 || percent > 99)) continue;
    const speaker = current.programSlug === offer.speaker_program_slug ? { status: "ready" as const, batch: current } : await readProgramRegistration(offer.speaker_program_slug);
    const certification = current.programSlug === offer.certification_program_slug ? { status: "ready" as const, batch: current } : await readProgramRegistration(offer.certification_program_slug);
    if (speaker.status !== "ready" || certification.status !== "ready") continue;
    return { slug: offer.slug, title: offer.title, priceIdr: price, dpPercent: percent,
      primary: speaker.batch, secondary: certification.batch };
  }
  return null;
}
