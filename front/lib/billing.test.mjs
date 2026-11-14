import assert from "node:assert/strict";
import test from "node:test";
import { initialBill, nextUniqueCode } from "./billing.ts";

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
