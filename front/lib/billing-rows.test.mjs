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

test("invoice rows carry email delivery status", () => {
  const rows = invoiceRows([
    reg(1, [
      {
        ...inv(10, "initial", 100, "pending", "2026-11-10T09:00:00+07:00"),
        academy_email_deliveries: [{ kind: "payment_instructions", status: "failed", attempts: 2 }],
      },
      inv(11, "remaining", 200, "pending", "2026-11-11T09:00:00+07:00"),
    ]),
  ]);
  const first = rows.find((r) => r.invoiceId === 10);
  const second = rows.find((r) => r.invoiceId === 11);
  assert.deepEqual(first.emails, [{ kind: "payment_instructions", status: "failed", attempts: 2 }]);
  assert.deepEqual(second.emails, []);
});

test("invoice rows carry payment history", () => {
  const rows = invoiceRows([
    reg(1, [
      {
        ...inv(10, "initial", 1300123, "pending", "2026-11-10T09:00:00+07:00"),
        academy_invoice_payments: [
          {
            id: 2,
            amount_idr: 300123,
            balance_after_idr: 0,
            note: "kedua",
            recorded_at: "2026-11-10T10:00:00+07:00",
            recorded_by: "u1",
            voided_at: "2026-11-10T11:00:00+07:00",
          },
          {
            id: 1,
            amount_idr: 1000000,
            balance_after_idr: 300123,
            note: null,
            recorded_at: "2026-11-10T09:30:00+07:00",
            recorded_by: "u1",
            voided_at: null,
          },
        ],
      },
      inv(11, "remaining", 200, "pending", "2026-11-11T09:00:00+07:00"),
    ]),
  ]);
  const first = rows.find((r) => r.invoiceId === 10);
  const second = rows.find((r) => r.invoiceId === 11);
  assert.deepEqual(first.payments, [
    {
      id: 1,
      amountIdr: 1000000,
      balanceAfterIdr: 300123,
      note: null,
      recordedAt: "2026-11-10T09:30:00+07:00",
      recordedBy: "u1",
      voided: false,
    },
    {
      id: 2,
      amountIdr: 300123,
      balanceAfterIdr: 0,
      note: "kedua",
      recordedAt: "2026-11-10T10:00:00+07:00",
      recordedBy: "u1",
      voided: true,
    },
  ]);
  assert.deepEqual(second.payments, []);
});
