// Batch hanya nama dan jadwal sesi; biaya dan DP ada di Program.
// Rancangan: docs/albana-docs/plans/2026-11-16-program-batch-bundling-design.md §5.2

export type SessionInput = {
  date: string;
  start: string;
  end: string;
  startOnly?: boolean;
  sessionCount?: number;
};
export type StoredSession = {
  starts_at: string;
  ends_at: string;
  start_only?: boolean;
  session_count?: number;
};
export type BatchStatus = "open" | "closed" | "done";

const NAIVE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

// Jadwal disimpan tanpa zona dan selalu berarti WIB. Tanpa ini server yang
// berjalan di UTC membaca jadwal bergeser tujuh jam dari yang dipakai RPC.
export function wibMs(value: string): number {
  if (typeof value !== "string") return Number.NaN;
  return Date.parse(NAIVE.test(value) ? `${value}+07:00` : value);
}

const startKey = (session: SessionInput) => `${session.date}T${session.start.slice(0, 5)}`;
const endKey = (session: SessionInput) => `${session.date}T${session.end.slice(0, 5)}`;

// Contoh berurut untuk nama batch berikutnya: angka terakhir pada judul bernomor
// tertinggi, ditambah satu. Hanya contoh; isian tidak diisi otomatis.
export function nextBatchName(titles: readonly string[]): string {
  let best: { title: string; value: number; index: number; length: number } | null = null;
  for (const raw of titles) {
    const title = String(raw);
    const last = [...title.matchAll(/\d+/g)].at(-1);
    if (!last) continue;
    const value = Number(last[0]);
    if (!Number.isSafeInteger(value)) continue;
    if (!best || value > best.value) best = { title, value, index: last.index, length: last[0].length };
  }
  if (!best) return "ASA Batch 1";
  return best.title.slice(0, best.index) + String(best.value + 1) + best.title.slice(best.index + best.length);
}

export function validateSessions(sessions: readonly SessionInput[]): string | null {
  if (!sessions.length || sessions.some((session) => !session.date || !session.start || !session.end)) {
    return "Setiap sesi wajib punya tanggal, waktu mulai, dan waktu selesai.";
  }
  if (sessions.some((session) => endKey(session) <= startKey(session))) {
    return "Waktu selesai sesi harus setelah waktu mulai.";
  }
  if (sessions[0]?.startOnly) {
    const count = sessions[0].sessionCount ?? 0;
    if (!Number.isInteger(count) || count < 1 || count > 30) {
      return "Jumlah sesi harus antara 1 sampai 30 pertemuan.";
    }
    return null;
  }
  const ordered = [...sessions].sort((a, b) => startKey(a).localeCompare(startKey(b)));
  if (ordered.some((session, index) => index > 0 && startKey(session) < endKey(ordered[index - 1]))) {
    return "Jadwal sesi tidak boleh tumpang tindih.";
  }
  return null;
}

// Basis data menerima YYYY-MM-DDTHH:MM saja; sebagian browser mengembalikan HH:MM:SS.
export function toStoredSessions(sessions: readonly SessionInput[]): StoredSession[] {
  if (sessions[0]?.startOnly) {
    const first = sessions[0];
    return [
      {
        starts_at: startKey(first),
        ends_at: endKey(first),
        start_only: true,
        session_count: first.sessionCount ?? 4,
      },
    ];
  }
  return sessions
    .map((session) => ({ starts_at: startKey(session), ends_at: endKey(session) }))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export function fromStoredSessions(value: unknown): SessionInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const [date = "", start = ""] = String(item.starts_at ?? "").split("T");
      const end = String(item.ends_at ?? "").split("T")[1] ?? "";
      const base: SessionInput = { date, start: start.slice(0, 5), end: end.slice(0, 5) };
      if (item.start_only === true) {
        base.startOnly = true;
        base.sessionCount =
          typeof item.session_count === "number" && Number.isInteger(item.session_count) && item.session_count >= 1
            ? item.session_count
            : 4;
      }
      return base;
    })
    .sort((a, b) => startKey(a).localeCompare(startKey(b)));
}

export function sessionCountOf(sessions: readonly SessionInput[]): number {
  if (sessions[0]?.startOnly) return sessions[0].sessionCount ?? 4;
  return sessions.length;
}

// Status mengikuti sakelar registration_open admin, tidak otomatis tertutup oleh tanggal.
export function batchStatus(
  batch: { registration_open: boolean; sessions?: unknown },
  _nowMs?: number,
): BatchStatus {
  void _nowMs;
  return batch.registration_open ? "open" : "closed";
}
