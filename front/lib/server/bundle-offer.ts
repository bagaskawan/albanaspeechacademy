import "server-only";

import type { RegistrationBatch } from "@/lib/registration";
import { academyRequest } from "./academy-api";
import { readProgramRegistration } from "./registration-batch";

export type BundleChoice = {
  slug: string;
  title: string;
  description: string | null;
  priceIdr: number;
  dpPercent: number | null;
  primary: RegistrationBatch;
  secondary: RegistrationBatch;
};

export async function readBundleChoice(current: RegistrationBatch): Promise<BundleChoice | null> {
  const rows = await academyRequest("bundle_offers?select=slug,title,description,speaker_program_slug,certification_program_slug,show_on_speaker,show_on_certification,placement_scope,price_idr,dp_percent&active=eq.true&placement_scope=eq.program&order=updated_at.desc&limit=100");
  if (!Array.isArray(rows)) return null;
  for (const raw of rows) {
    if (!raw || typeof raw !== "object") continue;
    const offer = raw as Record<string, unknown>;
    if (current.programSlug !== offer.speaker_program_slug && current.programSlug !== offer.certification_program_slug) continue;
    if (current.programSlug === offer.speaker_program_slug && !offer.show_on_speaker ||
      current.programSlug === offer.certification_program_slug && !offer.show_on_certification) continue;
    if (typeof offer.speaker_program_slug !== "string" || typeof offer.certification_program_slug !== "string" ||
      typeof offer.slug !== "string" || typeof offer.title !== "string") continue;
    const price = Number(offer.price_idr);
    const percent = offer.dp_percent === null ? null : Number(offer.dp_percent);
    if (!Number.isSafeInteger(price) || price <= 0 || percent !== null && (!Number.isInteger(percent) || percent < 1 || percent > 99)) continue;
    const speaker = current.programSlug === offer.speaker_program_slug ? { status: "ready" as const, batch: current } : await readProgramRegistration(offer.speaker_program_slug);
    const certification = current.programSlug === offer.certification_program_slug ? { status: "ready" as const, batch: current } : await readProgramRegistration(offer.certification_program_slug);
    if (speaker.status !== "ready" || certification.status !== "ready") continue;
    return { slug: offer.slug, title: offer.title, description: typeof offer.description === "string" ? offer.description : null, priceIdr: price, dpPercent: percent,
      primary: speaker.batch, secondary: certification.batch };
  }
  return null;
}
