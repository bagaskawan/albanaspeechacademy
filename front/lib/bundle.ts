// Paket Speaker + Sertifikasi: satu harga paket, ditawarkan di akhir formulir dari dua arah.
// Rancangan: docs/albana-docs/plans/2026-11-16-program-batch-bundling-design.md §5.4

export const BUNDLE_SLUG = "paket-speaker-sertifikasi";
export const SPEAKER_SLUG = "public-speaking-for-speakers";
export const CERTIFICATION_SLUG = "sertifikasi-pembicara-profesional";
export const INHOUSE_SLUG = "inhouse-training";

const money = (value: number) => Number.isSafeInteger(value) && value > 0;

// Harga paket harus lebih mahal dari tiap program sendirian, tetapi lebih murah
// daripada membeli keduanya; di luar rentang itu tawaran tidak masuk akal.
export function bundlePriceValid(packageIdr: number, speakerIdr: number, certificationIdr: number): boolean {
  if (!money(packageIdr) || !money(speakerIdr) || !money(certificationIdr)) return false;
  return packageIdr > speakerIdr && packageIdr > certificationIdr && packageIdr < speakerIdr + certificationIdr;
}

export function bundleAddOn(packageIdr: number, programIdr: number): number {
  return packageIdr - programIdr;
}

export function bundleSaving(packageIdr: number, speakerIdr: number, certificationIdr: number): number {
  return Math.max(0, speakerIdr + certificationIdr - packageIdr);
}

// Pembulatan sama dengan round() di RPC receive_academy_registration.
export function paymentSummary(
  priceIdr: number,
  dpPercent: number | null,
  method: "full" | "dp" | "",
): { feeIdr: number; payNowIdr: number; remainingIdr: number } {
  const payNowIdr = method === "dp" && dpPercent !== null ? Math.round((priceIdr * dpPercent) / 100) : priceIdr;
  return { feeIdr: priceIdr, payNowIdr, remainingIdr: priceIdr - payNowIdr };
}
