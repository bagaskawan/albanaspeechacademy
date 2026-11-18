import assert from "node:assert/strict";
import test from "node:test";
import { calendarSessions, monthRange, wibDate } from "./admin-calendar.ts";

const now = new Date("2026-11-16T03:00:00Z");
const programs = [{ slug: "series", title: "Series" }];
const batch = (slug, sessions, open = true) => ({ slug, title: slug.toUpperCase(), program_slug: "series", registration_open: open, sessions });

test("sesi jsonb WIB menjadi event berurutan dengan nomor sesi", () => {
  const { from, to } = monthRange("2026-12", now);
  const events = calendarSessions([
    batch("b2", [{ starts_at: "2026-12-12T09:00", ends_at: "2026-12-12T12:00" }, { starts_at: "2026-12-05T09:00", ends_at: "2026-12-05T12:00" }]),
    batch("b1", [{ starts_at: "2027-01-02T09:00", ends_at: "2027-01-02T12:00" }]),
  ], programs, from, to, now);
  assert.deepEqual(events.map((event) => [event.key, event.sequence, event.total]), [["b2-1", 1, 2], ["b2-2", 2, 2]]);
  assert.equal(new Date(events[0].startsAt).toISOString(), "2026-12-05T02:00:00.000Z");
  assert.equal(events[0].programTitle, "Series");
  assert.equal(events[0].status, "open");
});

test("batch start_only memakai jumlah pertemuan yang dicatat", () => {
  const { from, to } = monthRange("2026-12", now);
  const [event] = calendarSessions([batch("b3", [{ starts_at: "2026-12-01T19:00", ends_at: "2026-12-01T21:00", start_only: true, session_count: 6 }])], programs, from, to, now);
  assert.equal(event.startOnly, true);
  assert.equal(event.total, 6);
});

test("batas bulan WIB dan bulan tidak valid jatuh ke bulan berjalan", () => {
  assert.equal(monthRange("2026-12", now).from.toISOString(), "2026-11-30T17:00:00.000Z");
  assert.equal(monthRange("2026-13", now).month, 10);
  assert.equal(wibDate(Date.parse("2026-11-30T17:00:00Z")), "2026-12-01");
  const { from, to } = monthRange("2026-12", now);
  const edge = calendarSessions([batch("b4", [{ starts_at: "2026-12-01T00:30", ends_at: "2026-12-01T02:00" }])], programs, from, to, now);
  assert.equal(edge.length, 1);
});
