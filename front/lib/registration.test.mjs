import assert from "node:assert/strict";
import test from "node:test";
import { feeNote, isAcceptingBatch, pickAcceptingBatch } from "./registration.ts";

test("feeNote membuang baris yang hanya mengulang harga", () => {
  assert.equal(feeNote("Harga normal Rp1.500.000"), null);
  assert.equal(feeNote("Harga normal Rp1.500.000; harga berlaku Rp1.300.000"), null);
  assert.equal(feeNote("Harga normal Rp1.500.000; Termasuk modul"), "Termasuk modul");
  assert.equal(feeNote("Termasuk 4 pertemuan, modul, dan sertifikat."), "Termasuk 4 pertemuan, modul, dan sertifikat.");
  assert.equal(feeNote(null), null);
});

test("isAcceptingBatch memakai flag lalu fallback status", () => {
  assert.equal(isAcceptingBatch({ accepting_registrations: true, status: "closed" }), true);
  assert.equal(isAcceptingBatch({ status: "open" }), true);
  assert.equal(isAcceptingBatch({ status: "running" }), false);
});

test("pickAcceptingBatch memilih sesi paling awal di antara yang menerima", () => {
  const picked = pickAcceptingBatch([
    { slug: "b", accepting_registrations: true, sessions: [{ sequence_no: 1, starts_at: "2026-12-01T00:00:00Z" }] },
    { slug: "x", accepting_registrations: false, sessions: [{ sequence_no: 1, starts_at: "2026-11-01T00:00:00Z" }] },
    { slug: "a", accepting_registrations: true, sessions: [{ sequence_no: 1, starts_at: "2026-11-15T00:00:00Z" }] },
  ]);
  assert.equal(picked.slug, "a");
});
