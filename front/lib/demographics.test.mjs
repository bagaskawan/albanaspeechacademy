import assert from "node:assert/strict";
import test from "node:test";
import { OUTSIDE_INDONESIA, REGIONS, canonicalRegion } from "./demographics.ts";

test("daftar wilayah: 98 kota + 416 kabupaten + luar negeri, tanpa duplikat", () => {
  assert.equal(REGIONS.filter((name) => name.startsWith("Kota ")).length, 98);
  assert.equal(REGIONS.filter((name) => name.startsWith("Kabupaten ")).length, 416);
  assert.equal(new Set(REGIONS).size, REGIONS.length);
  assert.equal(REGIONS.at(-1), OUTSIDE_INDONESIA);
});

test("canonicalRegion mengabaikan huruf besar dan spasi, menolak nama di luar daftar", () => {
  assert.equal(canonicalRegion("  KOTA   bandung "), "Kota Bandung");
  assert.equal(canonicalRegion("Kabupaten Bandung Barat"), "Kabupaten Bandung Barat");
  assert.equal(canonicalRegion("Bandung"), null);
  assert.equal(canonicalRegion(7), null);
});
