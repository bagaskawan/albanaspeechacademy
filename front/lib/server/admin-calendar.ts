// Sesi kalender admin diturunkan langsung dari batches.sessions (jadwal WIB), jadi selalu sama dengan CMS.
// Murni tanpa I/O agar bisa diuji dengan `node --test`.
import { batchStatus, fromStoredSessions, sessionCountOf, wibMs, type BatchStatus } from "../program-batch.ts";

export type CalendarBatch = { slug: string; title: string; program_slug: string; registration_open: boolean; sessions: unknown };
export type CalendarSession = {
  key: string;
  batchSlug: string;
  batchTitle: string;
  programSlug: string;
  programTitle: string;
  /** Urutan sesi (1-based) dan total pertemuan batch. */
  sequence: number;
  total: number;
  startsAt: number;
  endsAt: number;
  /** Batch hanya mencatat tanggal mulai; sesi berikutnya belum terjadwal. */
  startOnly: boolean;
  status: BatchStatus;
};

/** Sesi yang beririsan dengan [from, to), urut waktu mulai. */
export function calendarSessions(
  batches: CalendarBatch[],
  programs: { slug: string; title: string }[],
  from: Date,
  to: Date,
  now: Date,
): CalendarSession[] {
  const programTitle = new Map(programs.map((program) => [program.slug, program.title]));
  return batches
    .flatMap((batch) => {
      const sessions = fromStoredSessions(batch.sessions);
      const total = sessionCountOf(sessions);
      const status = batchStatus(batch, now.getTime());
      return sessions.map((session, index) => ({
        key: `${batch.slug}-${index + 1}`,
        batchSlug: batch.slug,
        batchTitle: batch.title,
        programSlug: batch.program_slug,
        programTitle: programTitle.get(batch.program_slug) ?? batch.program_slug,
        sequence: index + 1,
        total,
        startsAt: wibMs(`${session.date}T${session.start}`),
        endsAt: wibMs(`${session.date}T${session.end}`),
        startOnly: !!session.startOnly,
        status,
      }));
    })
    .filter((session) => Number.isFinite(session.startsAt) && session.endsAt > from.getTime() && session.startsAt < to.getTime())
    .sort((a, b) => a.startsAt - b.startsAt);
}

const WIB = 7 * 3_600_000;

/** Rentang satu bulan kalender WIB dari "YYYY-MM"; bulan berjalan bila nilai tidak valid. */
export function monthRange(value: unknown, now: Date) {
  const local = new Date(now.getTime() + WIB);
  const match = typeof value === "string" ? /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value) : null;
  const year = match ? Number(match[1]) : local.getUTCFullYear();
  const month = match ? Number(match[2]) - 1 : local.getUTCMonth();
  return {
    year,
    month,
    from: new Date(Date.UTC(year, month, 1) - WIB),
    to: new Date(Date.UTC(year, month + 1, 1) - WIB),
  };
}

/** Kunci "YYYY-MM-DD" hari WIB dari epoch ms. */
export const wibDate = (ms: number) => new Date(ms + WIB).toISOString().slice(0, 10);
