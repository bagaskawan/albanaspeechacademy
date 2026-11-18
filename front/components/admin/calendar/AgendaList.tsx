import Link from "next/link";
import type { CalendarSession } from "@/lib/server/admin-calendar";

const TONES = ["bg-admin-butter-dot", "bg-admin-mint-dot", "bg-admin-lilac-dot", "bg-admin-peach-dot"] as const;
export type ProgramTones = Record<string, (typeof TONES)[number]>;

/** Warna tetap per program, urut daftar program (katalog program tetap 4). */
export const programTones = (programs: { slug: string }[]): ProgramTones =>
  Object.fromEntries(programs.map((program, index) => [program.slug, TONES[index % TONES.length]]));

const day = new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export const sessionLabel = (session: CalendarSession) =>
  session.startOnly ? `Mulai · ${session.total} pertemuan` : `Sesi ${session.sequence}/${session.total}`;
export const timeRange = (session: CalendarSession) => `${time.format(session.startsAt)}–${time.format(session.endsAt)} WIB`;

export function AgendaList({ sessions, empty, tones = {}, className = "" }: { sessions: CalendarSession[]; empty: string; tones?: ProgramTones; className?: string }) {
  if (sessions.length === 0) return <p className={`text-[14px] text-admin-text-secondary ${className}`}>{empty}</p>;
  return <ul className={`space-y-1 ${className}`}>{sessions.map((session) => <li key={session.key}>
    <Link href={`/admin/program/${session.programSlug}`} className={`flex gap-3 rounded-[16px] p-2 hover:bg-admin-surface-muted focus-visible:outline-2 focus-visible:outline-admin-ink ${session.status === "done" ? "opacity-60" : ""}`}>
      <span aria-hidden="true" className={`mt-1.5 size-2.5 shrink-0 rounded-full ${tones[session.programSlug] ?? "bg-admin-ink"}`} />
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-medium">{session.batchTitle}</span>
        <span className="block truncate text-[12px] text-admin-text-secondary">{session.programTitle} · {sessionLabel(session)}</span>
        <span className="block text-[12px] text-admin-text-secondary">{day.format(session.startsAt)} · {timeRange(session)}</span>
      </span>
    </Link>
  </li>)}</ul>;
}
