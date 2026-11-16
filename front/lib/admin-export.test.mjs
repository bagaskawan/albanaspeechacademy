import assert from "node:assert/strict";
import test from "node:test";
import { EXPORT_MODULES, exportFileName, toCsv } from "./admin-export.ts";

const columns = [{ header: "Nama", value: (row) => row.name }, { header: "Total", value: (row) => row.total }];

test("CSV starts with a BOM, uses commas, CRLF rows and Indonesian headers", () => {
  const csv = toCsv([{ name: "Rina", total: 260137 }], columns);
  assert.equal(csv, "﻿Nama,Total\r\nRina,260137\r\n");
});

test("quotes fields with commas, quotes and line breaks (RFC 4180)", () => {
  const csv = toCsv([{ name: 'Budi, "Boss"\nSantoso', total: null }], columns);
  assert.equal(csv, '﻿Nama,Total\r\n"Budi, ""Boss""\nSantoso",\r\n');
});

test("formula-looking cells are prefixed with an apostrophe", () => {
  for (const danger of ["=SUM(A1)", "+62812", "-1", "@cmd", "\tx", "\rx"]) {
    const csv = toCsv([{ name: danger, total: 1 }], columns);
    assert.ok(csv.split("\r\n")[1].replace(/^"/, "").startsWith("'"), danger);
  }
});

test("only known modules export; Pendaftaran exports both lists", () => {
  for (const module of ["pendaftar", "tagihan", "program", "batch", "trainer", "artikel", "testimoni", "partner"]) assert.ok(EXPORT_MODULES.includes(module), module);
  assert.equal(EXPORT_MODULES.includes("rekening"), false);
  assert.equal(EXPORT_MODULES.includes("media"), false);
});

test("file name carries the module and the WIB date", () => {
  assert.equal(exportFileName("pendaftar", new Date("2026-11-16T18:30:00Z")), "albana-pendaftar-2026-11-17.csv");
});
