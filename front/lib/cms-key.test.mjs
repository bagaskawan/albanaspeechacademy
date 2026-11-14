import assert from "node:assert/strict";
import test from "node:test";
import { decodeCmsKey, encodeCmsKey } from "./cms-key.ts";

test("kunci tunggal bolak-balik tanpa perubahan", () => {
  const key = encodeCmsKey({ slug: "public-speaking" }, ["slug"]);
  assert.equal(key, "public-speaking");
  assert.deepEqual(decodeCmsKey(key, ["slug"]), { slug: "public-speaking" });
});

test("kunci gabungan dipertahankan urutannya", () => {
  const key = encodeCmsKey({ batch_slug: "kelas-pagi", sequence_no: 2 }, ["batch_slug", "sequence_no"]);
  assert.equal(key, "kelas-pagi~2");
  assert.deepEqual(decodeCmsKey(key, ["batch_slug", "sequence_no"]), {
    batch_slug: "kelas-pagi",
    sequence_no: "2",
  });
});

test("pemisah di dalam nilai di-encode agar tidak memecah kunci", () => {
  const key = encodeCmsKey({ batch_slug: "kelas~pagi", sequence_no: 1 }, ["batch_slug", "sequence_no"]);
  assert.deepEqual(decodeCmsKey(key, ["batch_slug", "sequence_no"]), {
    batch_slug: "kelas~pagi",
    sequence_no: "1",
  });
});

test("kunci rusak ditolak", () => {
  assert.throws(() => decodeCmsKey("hanya-satu", ["batch_slug", "sequence_no"]));
  assert.throws(() => decodeCmsKey("%", ["slug"]));
});
