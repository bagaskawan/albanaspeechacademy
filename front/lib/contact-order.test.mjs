import assert from "node:assert/strict";
import test from "node:test";
import { sortContactRows } from "./contact-order.ts";

test("urutan kanal kontak tetap walau baris dari database berubah urutan", () => {
  const rows = [{ kind: "whatsapp" }, { kind: "address" }, { kind: "email" }, { kind: "instagram" }];
  assert.deepEqual(
    sortContactRows(rows).map((row) => row.kind),
    ["email", "instagram", "whatsapp", "address"],
  );
});

test("jenis tak dikenal diletakkan setelah kanal umum", () => {
  const rows = [{ kind: "telegram" }, { kind: "address" }];
  assert.deepEqual(
    sortContactRows(rows).map((row) => row.kind),
    ["address", "telegram"],
  );
});
