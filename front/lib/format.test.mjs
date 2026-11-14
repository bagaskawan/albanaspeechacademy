import assert from "node:assert/strict";
import test from "node:test";
import { formatRupiah } from "./format.ts";

test("formatRupiah memakai titik ribuan tanpa desimal", () => {
  assert.equal(formatRupiah(1500000), "Rp1.500.000");
  assert.equal(formatRupiah(0), "Rp0");
});
