import assert from "node:assert/strict";
import test from "node:test";
import { batchStatus, fromStoredSessions, nextBatchName, toStoredSessions, validateSessions, wibMs } from "./program-batch.ts";

test("placeholder menaikkan angka terakhir dari batch bernomor tertinggi", () => {
  assert.equal(nextBatchName(["ASA Batch 9"]), "ASA Batch 10");
  assert.equal(nextBatchName(["Batch 9", "Batch 10"]), "Batch 11");
  assert.equal(nextBatchName(["Batch 2026 Gel. 3"]), "Batch 2026 Gel. 4");
  assert.equal(nextBatchName([]), "ASA Batch 1");
  assert.equal(nextBatchName(["Kelas Akhir Tahun"]), "ASA Batch 1");
});

test("jadwal: wajib lengkap, selesai setelah mulai, tidak tumpang tindih", () => {
  const ok = { date: "2026-12-14", start: "08:30", end: "18:00" };
  assert.equal(validateSessions([ok]), null);
  assert.equal(validateSessions([]), "Setiap sesi wajib punya tanggal, waktu mulai, dan waktu selesai.");
  assert.equal(validateSessions([{ ...ok, end: "" }]), "Setiap sesi wajib punya tanggal, waktu mulai, dan waktu selesai.");
  assert.equal(validateSessions([{ ...ok, end: "08:30" }]), "Waktu selesai sesi harus setelah waktu mulai.");
  assert.equal(validateSessions([ok, { date: "2026-12-14", start: "17:00", end: "19:00" }]), "Jadwal sesi tidak boleh tumpang tindih.");
});

test("sesi disimpan terurut dengan jam HH:MM dan dapat dibaca kembali", () => {
  const stored = toStoredSessions([
    { date: "2026-12-21", start: "09:00:00", end: "12:00:00" },
    { date: "2026-12-14", start: "09:00", end: "12:00" },
  ]);
  assert.deepEqual(stored, [
    { starts_at: "2026-12-14T09:00", ends_at: "2026-12-14T12:00" },
    { starts_at: "2026-12-21T09:00", ends_at: "2026-12-21T12:00" },
  ]);
  assert.deepEqual(fromStoredSessions(stored)[0], { date: "2026-12-14", start: "09:00", end: "12:00" });
  assert.deepEqual(fromStoredSessions(null), []);
});

test("waktu tanpa zona dibaca sebagai WIB", () => {
  assert.equal(wibMs("2026-11-22T08:30"), Date.UTC(2026, 10, 22, 1, 30));
  assert.equal(wibMs("2026-11-22T08:30:00+07:00"), Date.UTC(2026, 10, 22, 1, 30));
  assert.ok(Number.isNaN(wibMs("bukan tanggal")));
});

test("status batch: dibuka, ditutup, selesai setelah sesi terakhir berakhir", () => {
  const sessions = [{ starts_at: "2026-11-21T09:00", ends_at: "2026-11-21T12:00" }, { starts_at: "2026-12-12T09:00", ends_at: "2026-12-12T12:00" }];
  const before = Date.UTC(2026, 11, 12, 4, 59); // 11.59 WIB
  const after = Date.UTC(2026, 11, 12, 5, 1);   // 12.01 WIB
  assert.equal(batchStatus({ registration_open: true, sessions }, before), "open");
  assert.equal(batchStatus({ registration_open: false, sessions }, before), "closed");
  assert.equal(batchStatus({ registration_open: true, sessions }, after), "done");
  assert.equal(batchStatus({ registration_open: false, sessions: [] }, after), "closed");
});
