import assert from "node:assert/strict";
import test from "node:test";
import { buildDashboardStats, periodRange, wibDayKey } from "./admin-dashboard.ts";

// 16 Nov 2026 10:00 WIB
const now = new Date("2026-11-16T03:00:00Z");

const reg = (id, receivedAt, invoices, extra = {}) => ({
  id, received_at: receivedAt, payment_method: "full", primary_batch_slug: "batch-a",
  answers: { source: "instagram", age: 28, gender: "Perempuan", priorExperience: false },
  items: [{ batch_slug: "batch-a" }], invoices, ...extra,
});
const inv = (status, total = 1_000_000, reviewedAt = null, createdAt = "2026-11-10T00:00:00Z") =>
  ({ status, total_idr: total, reviewed_at: reviewedAt, created_at: createdAt });

const catalog = {
  batches: [{ slug: "batch-a", title: "Batch A", program_slug: "series", registration_open: true }, { slug: "batch-b", title: "Batch B", program_slug: "speaker", registration_open: false }],
  programs: [{ slug: "series", title: "Series" }, { slug: "speaker", title: "Speaker" }],
};

test("WIB day boundary: 23:30 UTC is the next day in WIB", () => {
  assert.equal(wibDayKey(new Date("2026-11-15T16:59:00Z")), "2026-11-15");
  assert.equal(wibDayKey(new Date("2026-11-15T17:00:00Z")), "2026-11-16");
});

test("30d range starts at WIB midnight 29 days back; previous range has the same length", () => {
  const { start, previousStart } = periodRange("30d", now);
  assert.equal(start.toISOString(), "2026-10-17T17:00:00.000Z");
  assert.equal(start.getTime() - previousStart.getTime(), now.getTime() - start.getTime());
});

test("ytd starts on 1 January WIB", () => {
  assert.equal(periodRange("ytd", now).start.toISOString(), "2025-12-31T17:00:00.000Z");
});

test("registration counts and delta against the previous period", () => {
  const stats = buildDashboardStats({
    registrations: [
      reg(1, "2026-11-15T01:00:00Z", [inv("pending")]),
      reg(2, "2026-11-01T01:00:00Z", [inv("verified", 2_000_000, "2026-11-02T01:00:00Z")]),
      reg(3, "2026-10-01T01:00:00Z", [inv("verified", 500_000, "2026-10-02T01:00:00Z")]),
    ],
    pendingInvoices: [inv("pending", 1_000_000, null, "2026-11-10T00:00:00Z")],
    ...catalog,
  }, "30d", now);
  assert.equal(stats.registrations.current, 2);
  assert.equal(stats.registrations.previous, 1);
  assert.equal(stats.registrations.delta, 1);
  assert.equal(stats.verified.current, 2_000_000);
  assert.equal(stats.verified.previous, 500_000);
  assert.equal(stats.pending.count, 1);
  assert.equal(stats.pending.total, 1_000_000);
  assert.equal(stats.pending.oldestDays, 6);
  assert.equal(stats.settlement.current, 50);
});

test("rejected or cancelled registrations are not active in batch ranking", () => {
  const stats = buildDashboardStats({
    registrations: [
      reg(1, "2026-11-15T01:00:00Z", [inv("verified", 1, "2026-11-15T02:00:00Z")]),
      reg(2, "2026-11-14T01:00:00Z", [inv("rejected")]),
      reg(3, "2026-11-13T01:00:00Z", [inv("cancelled")]),
      reg(4, "2026-11-12T01:00:00Z", [inv("pending")]),
    ],
    pendingInvoices: [], ...catalog,
  }, "30d", now);
  assert.deepEqual(stats.topBatches.map((row) => [row.slug, row.active, row.verified, row.paidPercent]), [["batch-a", 2, 1, 50]]);
  assert.deepEqual(stats.perProgram, [{ slug: "series", title: "Series", count: 2 }]);
});

test("age buckets and the n < 5 threshold", () => {
  const ages = [19, 25, 34, 35, 44, 45];
  const registrations = ages.map((age, index) => reg(index + 1, "2026-11-10T01:00:00Z", [inv("pending")], {
    answers: { source: index % 2 ? "whatsapp" : "referral", age, gender: "Laki-laki", priorExperience: true },
  }));
  const stats = buildDashboardStats({ registrations, pendingInvoices: [], ...catalog }, "30d", now);
  assert.deepEqual(stats.composition.age.rows.map((row) => row.count), [1, 2, 2, 1]);
  assert.equal(stats.composition.age.enough, true);
  const few = buildDashboardStats({ registrations: registrations.slice(0, 4), pendingInvoices: [], ...catalog }, "30d", now);
  assert.equal(few.composition.source.enough, false);
});

test("trend has 12 weekly buckets for 30d and monthly buckets for ytd", () => {
  const input = { registrations: [reg(1, "2026-11-16T01:00:00Z", [inv("pending")])], pendingInvoices: [], ...catalog };
  const weekly = buildDashboardStats(input, "30d", now).trend;
  assert.equal(weekly.buckets.length, 12);
  assert.equal(weekly.buckets.at(-1).registrations, 1);
  assert.equal(buildDashboardStats(input, "ytd", now).trend.buckets.length, 11);
});

test("filter program/batch menyaring pendaftar, tagihan, dan batch", () => {
  const input = {
    registrations: [
      reg(1, "2026-11-15T01:00:00Z", [inv("pending")]),
      reg(2, "2026-11-14T01:00:00Z", [inv("pending")], { items: [{ batch_slug: "batch-b" }] }),
      reg(3, "2026-11-13T01:00:00Z", [inv("pending")], { items: [{ batch_slug: "batch-a" }, { batch_slug: "batch-b" }] }),
    ],
    pendingInvoices: [
      { ...inv("pending", 100), stage: "initial", batches: ["batch-a"] },
      { ...inv("pending", 200), stage: "remaining", batches: ["batch-b"] },
    ],
    ...catalog,
  };
  const all = buildDashboardStats(input, "30d", now);
  assert.equal(all.registrations.current, 3);
  assert.equal(all.pending.remainingCount, 1);
  assert.equal(all.pending.remainingTotal, 200);
  const speaker = buildDashboardStats(input, "30d", now, { program: "speaker" });
  assert.equal(speaker.registrations.current, 2);
  assert.equal(speaker.pending.count, 1);
  assert.equal(speaker.openBatches, 0);
  assert.deepEqual(speaker.topBatches.map((row) => [row.slug, row.active]), [["batch-b", 2]]);
  assert.equal(buildDashboardStats(input, "30d", now, { batch: "batch-a" }).registrations.current, 2);
});

test("domisili top-N dengan sisa Lainnya; profesi per kategori", () => {
  const cities = ["Kota Bandung", "Kota Bandung", "Kota Bandung", "Kota Bekasi", "Kota Bekasi", "Kota Depok", "Kota Bogor"];
  const registrations = cities.map((domicile, index) => reg(index + 1, "2026-11-10T01:00:00Z", [inv("pending")], {
    answers: { domicile, professionCategory: index < 5 ? "wirausaha" : "lainnya" },
  }));
  const stats = buildDashboardStats({ registrations, pendingInvoices: [], ...catalog }, "30d", now);
  const top = stats.composition.domicile;
  assert.equal(top.n, 7);
  assert.deepEqual(top.rows.slice(0, 2).map((row) => [row.label, row.count]), [["Kota Bandung", 3], ["Kota Bekasi", 2]]);
  const profession = stats.composition.profession.rows;
  assert.equal(profession.find((row) => row.label === "Wirausaha").count, 5);
  assert.equal(profession.find((row) => row.label === "Lainnya").count, 2);
});
