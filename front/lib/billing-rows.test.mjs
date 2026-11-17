import assert from "node:assert/strict";
import test from "node:test";
import { invoiceRows } from "./billing-rows.ts";

const reg = (id, invoices) => ({
  id, full_name: `Nama ${id}`, email: `n${id}@example.invalid`, whatsapp: "081200000000",
  offer_title: "Paket Speaker + Sertifikasi", received_at: "2026-11-17T09:00:00+07:00",
  academy_registration_items: [{ batch_slug: "asa-batch-1" }, { batch_slug: "batch-9-exclusive" }],
  academy_invoices: invoices,
});
const inv = (id, stage, total, status, created) => ({
  id, stage, subtotal_idr: total, unique_code: 1, total_idr: total, status,
  reviewed_by: null, reviewed_at: null, created_at: created,
});

test("satu baris per tagihan, terbaru dulu", () => {
  const rows = invoiceRows([reg(1, [
    inv(10, "initial", 580000, "verified", "2026-11-17T09:05:00+07:00"),
    inv(11, "remaining", 2320000, "pending", "2026-11-18T09:05:00+07:00"),
  ])]);
  assert.deepEqual(rows.map((row) => row.invoiceId), [11, 10]);
  assert.deepEqual(rows.map((row) => row.stageLabel), ["Pelunasan", "Awal"]);
  assert.equal(rows[0].totalIdr, 2320000);
  assert.equal(rows[1].status, "verified");
});

test("pendaftaran tanpa tagihan tetap punya satu baris", () => {
  const rows = invoiceRows([reg(2, [])]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].invoiceId, null);
  assert.equal(rows[0].totalIdr, null);
  assert.equal(rows[0].stageLabel, "—");
  assert.equal(rows[0].createdAt, "2026-11-17T09:00:00+07:00");
});

test("baris dari beberapa pendaftaran diurutkan bersama", () => {
  const rows = invoiceRows([
    reg(1, [inv(10, "initial", 100, "pending", "2026-11-10T09:00:00+07:00")]),
    reg(2, [inv(20, "initial", 200, "pending", "2026-11-20T09:00:00+07:00")]),
  ]);
  assert.deepEqual(rows.map((row) => row.invoiceId), [20, 10]);
});
