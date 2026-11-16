// CSV export (admin-ui-patterns §8.7, plan 3.18). Pure helpers so `node --test` can run them.

export const EXPORT_MODULES = ["pendaftar", "tagihan", "program", "batch", "trainer", "artikel", "testimoni", "partner"] as const;
export type ExportModule = (typeof EXPORT_MODULES)[number];
export const isExportModule = (value: string): value is ExportModule => (EXPORT_MODULES as readonly string[]).includes(value);

export const EXPORT_ROW_LIMIT = 5000;

export type ExportColumn<Row> = { header: string; value: (row: Row) => unknown };

// Cells a spreadsheet would run as a formula get a leading apostrophe (CSV injection).
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = Array.isArray(value) ? value.join("; ") : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** UTF-8 BOM (Excel), comma separator, CRLF rows, RFC 4180 quoting. */
export function toCsv<Row>(rows: Row[], columns: ExportColumn<Row>[]): string {
  const lines = [columns.map((column) => cell(column.header)), ...rows.map((row) => columns.map((column) => cell(column.value(row))))];
  return `﻿${lines.map((line) => line.join(",")).join("\r\n")}\r\n`;
}

const WIB = 7 * 3_600_000;
/** "2026-11-16 14:32" in WIB, or "" when empty. */
export const wibDateTime = (iso: string | null | undefined) => (iso ? new Date(Date.parse(iso) + WIB).toISOString().slice(0, 16).replace("T", " ") : "");

export const exportFileName = (module: ExportModule, now: Date) => `albana-${module}-${new Date(now.getTime() + WIB).toISOString().slice(0, 10)}.csv`;
