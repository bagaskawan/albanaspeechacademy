import assert from "node:assert/strict";
import test from "node:test";
import { parseCmsInput } from "./cms-validation.ts";

test("artikel tetap draf dan hanya menerima kolom yang dikenal", () => {
  const article = { slug: "contoh", title: "Contoh", excerpt: "Ringkasan", body: "Isi", published: false };
  assert.deepEqual(parseCmsInput("articles", article), article);
  assert.equal(parseCmsInput("articles", { ...article, service_role: true }), null);
});

test("publikasi media membutuhkan izin", () => {
  const gallery = { asset_url: "https://example.com/a.jpg", alt_text: "Kelas", published: true };
  assert.equal(parseCmsInput("gallery", gallery), null);
  assert.equal(parseCmsInput("gallery", { ...gallery, consent_at: "2026-11-10T10:00" })?.consent_at, "2026-11-10T10:00:00+07:00");
});

test("batch terbuka memerlukan data lengkap dan tidak mengaktifkan kuota yang belum disetujui", () => {
  const batch = { slug: "batch-a", program_slug: "public-speaking-series", title: "Batch A", status: "open" };
  assert.equal(parseCmsInput("batches", batch), null);
  assert.ok(parseCmsInput("batches", { ...batch, venue: "Ruang kelas", address: "Bandung", price_idr: 100000, proof_on_followup: true, form_kind: "series" }));
});
