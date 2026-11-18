import assert from "node:assert/strict";
import test from "node:test";
import { initialBill, nextUniqueCode, parseRupiahInput, paymentBalance } from "./billing.ts";

test("lunas memakai seluruh harga sebagai subtotal", () => {
  assert.deepEqual(initialBill(1_300_000, "full", 20), {
    subtotalIdr: 1_300_000,
    remainingIdr: 0,
  });
});

test("DP dibulatkan ke rupiah dan menyisakan harga yang tepat", () => {
  assert.deepEqual(initialBill(1_300_001, "dp", 20), {
    subtotalIdr: 260_000,
    remainingIdr: 1_040_001,
  });
});

test("kode unik mengambil kode pertama yang belum dipakai", () => {
  assert.equal(nextUniqueCode(new Set([1, 2, 4])), 3);
  assert.equal(nextUniqueCode(new Set(Array.from({ length: 999 }, (_, i) => i + 1))), null);
});

test("harga dan persentase tidak sah ditolak", () => {
  assert.throws(() => initialBill(-1, "full", null));
  assert.throws(() => initialBill(100, "dp", null));
  assert.throws(() => initialBill(100, "dp", 0));
});

test("parseRupiahInput accepts bank-style formats", () => {
  assert.equal(parseRupiahInput("1.300.123"), 1_300_123);
  assert.equal(parseRupiahInput("Rp 1.300.123"), 1_300_123);
  assert.equal(parseRupiahInput("1300123"), 1_300_123);
});

test("parseRupiahInput rejects ambiguous input", () => {
  for (const bad of ["", "0", "-5", "1,5", "12a", "1.300.123,50"]) {
    assert.equal(parseRupiahInput(bad), null, bad);
  }
});

test("payment balance reports shortfall", () => {
  assert.deepEqual(paymentBalance(1_300_123, [1_000_000]), {
    paidIdr: 1_000_000,
    balanceIdr: 300_123,
    state: "short",
  });
});

test("payment balance reports exact and over", () => {
  assert.deepEqual(paymentBalance(1_300_123, [1_000_000, 300_123]), {
    paidIdr: 1_300_123,
    balanceIdr: 0,
    state: "exact",
  });
  assert.deepEqual(paymentBalance(1_300_123, [1_400_000]), {
    paidIdr: 1_400_000,
    balanceIdr: -99_877,
    state: "over",
  });
});

test("payment balance with no entries", () => {
  assert.deepEqual(paymentBalance(1_300_123, []), {
    paidIdr: 0,
    balanceIdr: 1_300_123,
    state: "none",
  });
});
