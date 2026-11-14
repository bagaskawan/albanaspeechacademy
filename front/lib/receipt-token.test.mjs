import assert from "node:assert/strict";
import test from "node:test";
import { createReceiptToken, readReceiptToken } from "./receipt-token.ts";

test("token tanda terima membuka ID hanya dengan rahasia yang tepat", () => {
  const token = createReceiptToken(42, "secret-for-test");
  assert.equal(readReceiptToken(token, "secret-for-test"), 42);
  assert.equal(readReceiptToken(token, "wrong-secret"), null);
  assert.equal(readReceiptToken(token.replace(/.$/, "x"), "secret-for-test"), null);
});

test("ID yang diubah tidak dapat membuka pendaftaran lain", () => {
  const token = createReceiptToken(42, "secret-for-test");
  assert.equal(readReceiptToken(token.replace(/^42/, "43"), "secret-for-test"), null);
  assert.equal(readReceiptToken("bad", "secret-for-test"), null);
});

test("token lama dan waktu kedaluwarsa yang diubah ditolak", () => {
  const now = 1_800_000_000_000;
  const token = createReceiptToken(42, "secret-for-test", now);
  assert.equal(readReceiptToken(token, "secret-for-test", now + 30 * 86400_000), 42);
  assert.equal(readReceiptToken(token, "secret-for-test", now + 31 * 86400_000), null);
  assert.equal(readReceiptToken(token.replace(/\.(\d+)\./, ".9999999999999."), "secret-for-test", now), null);
});
