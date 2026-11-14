import assert from "node:assert/strict";
import test from "node:test";
import { cmsCollections } from "./cms-fields.ts";
import { ADMIN_PAGE_SIZE, displayValue, filterRows, listFields, paginateRows, primaryValue, statusOf } from "./admin-list.ts";

const programs = cmsCollections.programs;
const batches = cmsCollections.batches;

test("kolom daftar memuat identitas lebih dulu tanpa teks panjang, JSON, atau status ganda", () => {
  assert.deepEqual(
    listFields(programs).map((field) => field.name),
    ["title", "slug", "format", "certification"],
  );
  assert.deepEqual(
    listFields(cmsCollections.articles).map((field) => field.name),
    ["title", "slug"],
  );
});

test("nilai utama memakai judul lalu slug", () => {
  assert.equal(primaryValue({ title: "Kelas Dasar", slug: "kelas-dasar" }, programs), "Kelas Dasar");
  assert.equal(primaryValue({ slug: "kelas-dasar" }, programs), "kelas-dasar");
});

test("status mengikuti kolom published atau status", () => {
  assert.deepEqual(statusOf(programs, { published: true }), { label: "Terbit", tone: "positive" });
  assert.deepEqual(statusOf(programs, { published: false }), { label: "Draf", tone: "neutral" });
  assert.deepEqual(statusOf(batches, { status: "open" }), { label: "Dibuka", tone: "positive" });
  assert.deepEqual(statusOf(batches, { status: "cancelled" }), { label: "Dibatalkan", tone: "negative" });
  assert.deepEqual(statusOf(cmsCollections.bank_accounts, { active: false }), { label: "Nonaktif", tone: "neutral" });
});

test("tanggal dan rupiah diformat untuk tampilan", () => {
  const closesAt = displayValue({ name: "closes_at", type: "datetime" }, { closes_at: "2026-11-10T12:00:00Z" });
  assert.match(closesAt, /2026/);
  assert.equal(displayValue({ name: "price_idr", type: "number" }, { price_idr: 1500000 }), "Rp1.500.000");
  assert.equal(displayValue({ name: "venue" }, {}), "—");
});

test("pencarian mencocokkan beberapa kolom tanpa peduli huruf besar", () => {
  const rows = [{ title: "Kelas Dasar", slug: "kelas-dasar" }, { title: "Kelas Lanjut", slug: "kelas-lanjut" }];
  assert.equal(filterRows(rows, programs, "dasar").length, 1);
  assert.equal(filterRows(rows, programs, "KELAS").length, 2);
  assert.equal(filterRows(rows, programs, "  ").length, 2);
});

test("pagination memotong 10 baris dan menjepit halaman", () => {
  const rows = Array.from({ length: 23 }, (_, index) => ({ slug: `baris-${index}` }));
  const first = paginateRows(rows, 1);
  assert.equal(ADMIN_PAGE_SIZE, 10);
  assert.equal(first.items.length, 10);
  assert.deepEqual({ start: first.start, end: first.end, pages: first.totalPages }, { start: 1, end: 10, pages: 3 });
  const last = paginateRows(rows, 99);
  assert.equal(last.page, 3);
  assert.deepEqual({ start: last.start, end: last.end }, { start: 21, end: 23 });
  assert.equal(paginateRows([], 1).totalPages, 1);
});
