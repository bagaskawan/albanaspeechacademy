import "server-only";

import type { RegistrationBatch } from "@/lib/registration";
import { CERTIFICATION_SLUG, bundleAddOn, bundlePriceValid, bundleSaving } from "@/lib/bundle";
import { academyRequest } from "./academy-api";
import { readProgramRegistration } from "./registration-batch";

export type BundleOffer = {
  slug: string;
  title: string;
  description: string | null;
  packagePriceIdr: number;
  /** DP paket; bila penawaran tidak mengisinya, DP program asal yang dipakai. */
  dpPercent: number | null;
  addOnIdr: number;
  savingIdr: number;
  /** Batch yang sedang dibuka pada program pasangan. */
  partner: RegistrationBatch;
  partnerIsCertification: boolean;
};

// Satu penawaran untuk pasangan Speaker <-> Sertifikasi, ditawarkan dari dua arah.
// Tawaran hanya muncul bila harga paket masih sah terhadap biaya kedua program dan
// program pasangan punya batch yang menerima pendaftaran.
export async function readBundleOffer(current: RegistrationBatch): Promise<BundleOffer | null> {
  const rows = await academyRequest(
    "bundle_offers?select=slug,title,description,speaker_program_slug,certification_program_slug,price_idr,dp_percent&active=eq.true&placement_scope=eq.program&order=updated_at.desc&limit=1",
  );
  if (!Array.isArray(rows) || !rows.length) return null;
  const offer = rows[0] as Record<string, unknown>;
  const speakerSlug = offer.speaker_program_slug;
  const certificationSlug = offer.certification_program_slug;
  if (typeof speakerSlug !== "string" || typeof certificationSlug !== "string" ||
    typeof offer.slug !== "string" || typeof offer.title !== "string") return null;

  const partnerSlug = current.programSlug === speakerSlug ? certificationSlug
    : current.programSlug === certificationSlug ? speakerSlug : null;
  if (!partnerSlug) return null;

  const packagePriceIdr = Number(offer.price_idr);
  const dpValue = offer.dp_percent === null || offer.dp_percent === undefined ? null : Number(offer.dp_percent);
  if (dpValue !== null && (!Number.isInteger(dpValue) || dpValue < 1 || dpValue > 99)) return null;

  const partner = await readProgramRegistration(partnerSlug);
  if (partner.status !== "ready") return null;
  const speakerPrice = current.programSlug === speakerSlug ? current.priceIdr : partner.batch.priceIdr;
  const certificationPrice = current.programSlug === certificationSlug ? current.priceIdr : partner.batch.priceIdr;
  if (!bundlePriceValid(packagePriceIdr, speakerPrice, certificationPrice)) return null;

  return {
    slug: offer.slug,
    title: offer.title,
    description: typeof offer.description === "string" && offer.description.trim() !== "" ? offer.description : null,
    packagePriceIdr,
    dpPercent: dpValue ?? current.dpPercent,
    addOnIdr: bundleAddOn(packagePriceIdr, current.priceIdr),
    savingIdr: bundleSaving(packagePriceIdr, speakerPrice, certificationPrice),
    partner: partner.batch,
    partnerIsCertification: partner.batch.programSlug === CERTIFICATION_SLUG,
  };
}
