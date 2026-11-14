import assert from "node:assert/strict";
import test from "node:test";
import { parseAcademySubmission } from "./academy-registration-input.ts";

const input = {
  batch: "batch-9-series", consent: true, formKind: "series", priceIdr: 1_500_000,
  paymentMethod: "full", fullName: "Budi", email: "BUDI@example.invalid", whatsapp: "081200000000",
  idempotencyKey: "0e164e45-3928-45ed-8a03-032e9c8f8f4e",
  answers: {
    nickname: "Bud", domicile: "Bandung", profession: "Pengajar", goal: "Latihan",
    challenge: "Gugup", age: 25, gender: "Laki-laki", priorExperience: false,
    source: "instagram", attendance: "yes", institution: "Tidak ada",
  },
};

test("form tunggal dipetakan ke dua batch kosong dan harga terduga", () => {
  const value = parseAcademySubmission(input);
  assert.equal(value.primaryBatchSlug, "batch-9-series");
  assert.equal(value.secondaryBatchSlug, null);
  assert.equal(value.expectedPriceIdr, 1_500_000);
  assert.equal(value.email, "budi@example.invalid");
});

test("bundle mewajibkan slug penawaran dan batch kedua", () => {
  const bundled = parseAcademySubmission({ ...input, offerSlug: "speaker-sertifikasi", secondaryBatchSlug: "bnsp-1" });
  assert.equal(bundled.offerSlug, "speaker-sertifikasi");
  assert.equal(bundled.secondaryBatchSlug, "bnsp-1");
  assert.equal(parseAcademySubmission({ ...input, offerSlug: "speaker-sertifikasi" }), null);
  assert.equal(parseAcademySubmission({ ...input, secondaryBatchSlug: "bnsp-1" }), null);
});

test("kiriman tanpa kunci idempoten atau harga sah ditolak", () => {
  assert.equal(parseAcademySubmission({ ...input, idempotencyKey: "x" }), null);
  assert.equal(parseAcademySubmission({ ...input, priceIdr: -1 }), null);
});
