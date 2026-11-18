import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AgendaList, programTones, sessionLabel, timeRange } from "@/components/admin/calendar/AgendaList";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { calendarSessions, monthRange, wibDate } from "@/lib/server/admin-calendar";

export const dynamic = "force-dynamic";

const card = "rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]";
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const monthKey = (year: number, month: number) => {
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

export default async function KalenderPage({ searchParams }: { searchParams: Promise<{ bulan?: string; program?: string }> }) {
  await requireAdminMember();
  const params = await searchParams;
  const now = new Date();
  const { year, month, from, to } = monthRange(params.bulan, now);
  const db = academyBillingClient();
  const [batches, programs] = await Promise.all([
    db.from("batches").select("slug,title,program_slug,registration_open,sessions"),
    db.from("programs").select("slug,title").order("title"),
  ]);
  const failed = [batches, programs].find((result) => result.error);
  if (failed?.error) throw new Error(`Kalender gagal dimuat: ${failed.error.message}`);

  const programRows = programs.data ?? [];
  const program = programRows.some((row) => row.slug === params.program) ? params.program! : null;
  const tones = programTones(programRows);
  const sessions = calendarSessions((batches.data ?? []).filter((row) => !program || row.program_slug === program), programRows, from, to, now);
  const current = monthRange(undefined, now);
  const href = (changes: { bulan?: string; program?: string | null }) => {
    const next = new URLSearchParams();
    const bulan = changes.bulan ?? monthKey(year, month);
    const prog = changes.program === undefined ? program : changes.program;
    if (bulan !== monthKey(current.year, current.month)) next.set("bulan", bulan);
    if (prog) next.set("program", prog);
    const query = next.toString();
    return query ? `/admin/kalender?${query}` : "/admin/kalender";
  };

  // Grid Senin-Minggu; sel di luar bulan kosong.
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const cells = Array.from({ length: Math.ceil((lead + daysInMonth) / 7) * 7 }, (_, index) => {
    const date = index - lead + 1;
    return date >= 1 && date <= daysInMonth ? `${monthKey(year, month)}-${String(date).padStart(2, "0")}` : null;
  });
  const byDay = new Map<string, typeof sessions>();
  for (const session of sessions) byDay.set(wibDate(session.startsAt), [...(byDay.get(wibDate(session.startsAt)) ?? []), session]);
  const today = wibDate(now.getTime());
  const title = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)));

  return <div className="space-y-[var(--admin-gap-card)]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Link href={href({ bulan: monthKey(year, month - 1) })} aria-label="Bulan sebelumnya" className="inline-flex size-11 items-center justify-center rounded-full border border-admin-line-strong hover:bg-admin-surface-muted"><ChevronLeft aria-hidden="true" size={20} /></Link>
        <h2 className="min-w-[160px] text-center text-[20px] font-medium capitalize" aria-live="polite">{title}</h2>
        <Link href={href({ bulan: monthKey(year, month + 1) })} aria-label="Bulan berikutnya" className="inline-flex size-11 items-center justify-center rounded-full border border-admin-line-strong hover:bg-admin-surface-muted"><ChevronRight aria-hidden="true" size={20} /></Link>
      </div>
      <nav aria-label="Filter program" className="flex flex-wrap gap-2">
        <Link href={href({ program: null })} aria-current={!program ? "page" : undefined} className={`inline-flex h-10 items-center rounded-full px-4 text-[13px] ${!program ? "bg-admin-ink text-admin-on-ink" : "bg-admin-surface hover:bg-admin-surface-muted"}`}>Semua</Link>
        {programRows.map((row) => <Link key={row.slug} href={href({ program: row.slug })} aria-current={program === row.slug ? "page" : undefined}
          className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] ${program === row.slug ? "bg-admin-ink text-admin-on-ink" : "bg-admin-surface hover:bg-admin-surface-muted"}`}>
          <span aria-hidden="true" className={`size-2 rounded-full ${tones[row.slug]}`} />{row.title}
        </Link>)}
      </nav>
    </div>

    <section aria-label={`Kalender ${title}`} className={`${card} hidden md:block`}>
      <div className="grid grid-cols-7 gap-px text-[12px] text-admin-text-secondary">{WEEKDAYS.map((name) => <div key={name} className="px-2 pb-2">{name}</div>)}</div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[16px] bg-admin-line">
        {cells.map((key, index) => <div key={key ?? `empty-${index}`} className={`min-h-[112px] p-2 ${key ? "bg-admin-surface" : "bg-admin-surface-muted"}`}>
          {key && <>
            <p className={`text-[12px] ${key === today ? "inline-flex size-6 items-center justify-center rounded-full bg-admin-ink font-medium text-admin-on-ink" : "text-admin-text-secondary"}`}>{Number(key.slice(8))}</p>
            <ul className="mt-1 space-y-1">{(byDay.get(key) ?? []).map((session) => <li key={session.key}>
              <Link href={`/admin/program/${session.programSlug}`} title={`${session.programTitle} · ${session.batchTitle} · ${sessionLabel(session)} · ${timeRange(session)}`}
                className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] hover:bg-admin-surface-muted ${session.status === "done" ? "opacity-60" : ""}`}>
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${tones[session.programSlug]}`} />
                <span className="truncate">{session.batchTitle}</span>
              </Link>
            </li>)}</ul>
          </>}
        </div>)}
      </div>
    </section>

    <section className={card}>
      <h2 className="text-[17px] font-medium">Agenda {title}</h2>
      <p className="mt-1 text-[13px] text-admin-text-secondary">{sessions.length} sesi · jadwal mengikuti batch di Program</p>
      <AgendaList sessions={sessions} tones={tones} empty="Tidak ada sesi pada bulan ini." className="mt-5" />
    </section>
  </div>;
}
