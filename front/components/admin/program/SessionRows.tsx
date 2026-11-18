"use client";

import { Plus, Trash2 } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { AdminInput } from "@/components/admin/ui/form/controls";
import { rowDangerActionClass } from "@/components/admin/ui/data-table";
import type { SessionInput } from "@/lib/program-batch";

const pillClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-admin-line-strong bg-admin-canvas px-4 text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-surface cursor-pointer";

export function SessionRows({
  sessions,
  onChange,
}: {
  sessions: SessionInput[];
  onChange: (next: SessionInput[]) => void;
}) {
  const isStartOnly = Boolean(sessions[0]?.startOnly);
  const first = sessions[0] ?? { date: "", start: "", end: "" };

  const patch = (index: number, part: Partial<SessionInput>) =>
    onChange(sessions.map((item, i) => (i === index ? { ...item, ...part } : item)));

  function switchMode(mode: "per_session" | "start_only") {
    if (mode === "start_only") {
      onChange([
        {
          date: first.date,
          start: first.start,
          end: first.end,
          startOnly: true,
          sessionCount: first.sessionCount ?? (sessions.length > 1 ? sessions.length : 4),
        },
      ]);
    } else {
      onChange([
        {
          date: first.date,
          start: first.start,
          end: first.end,
        },
      ]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-full border border-admin-line bg-admin-surface p-1">
        <button
          type="button"
          onClick={() => switchMode("per_session")}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
            !isStartOnly
              ? "bg-admin-ink text-admin-on-ink"
              : "text-admin-text-secondary hover:text-admin-ink"
          }`}
        >
          Rinci per sesi
        </button>
        <button
          type="button"
          onClick={() => switchMode("start_only")}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
            isStartOnly
              ? "bg-admin-ink text-admin-on-ink"
              : "text-admin-text-secondary hover:text-admin-ink"
          }`}
        >
          Tanggal mulai saja
        </button>
      </div>

      {isStartOnly ? (
        <div className="space-y-3 rounded-[20px] border border-admin-line p-3.5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-admin-text-secondary">
                Tanggal mulai
              </label>
              <DatePicker
                value={first.date}
                onChange={(date) => patch(0, { date })}
                placeholder="Pilih tanggal mulai"
                className="h-12 rounded-full border-admin-line bg-admin-surface px-4 text-sm text-admin-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-admin-text-secondary">
                Jumlah sesi (pertemuan)
              </label>
              <AdminInput
                type="number"
                min={1}
                max={30}
                value={first.sessionCount ?? 4}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  patch(0, {
                    sessionCount: Number.isFinite(val) ? Math.max(1, Math.min(30, Math.trunc(val))) : 1,
                  });
                }}
              />
            </div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-admin-text-secondary">
                Jam mulai (WIB)
              </label>
              <TimePicker
                value={first.start}
                onChange={(start) => patch(0, { start })}
                placeholder="Jam mulai"
                className="h-12 rounded-full border-admin-line bg-admin-surface px-4 text-sm text-admin-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-admin-text-secondary">
                Jam selesai (WIB)
              </label>
              <TimePicker
                value={first.end}
                onChange={(end) => patch(0, { end })}
                placeholder="Jam selesai"
                className="h-12 rounded-full border-admin-line bg-admin-surface px-4 text-sm text-admin-ink"
              />
            </div>
          </div>
          <p className="text-[12px] text-admin-text-secondary">
            Menampilkan tanggal mulai dan total {first.sessionCount ?? 4} pertemuan pada halaman publik.
          </p>
        </div>
      ) : (
        <>
          {sessions.map((session, index) => (
            <div key={index} className="rounded-[20px] border border-admin-line p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-admin-text-secondary">
                  Sesi {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(sessions.filter((_, i) => i !== index))}
                  disabled={sessions.length === 1}
                  aria-label={`Hapus sesi ${index + 1}`}
                  className={rowDangerActionClass}
                >
                  <Trash2 aria-hidden="true" size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <DatePicker
                  value={session.date}
                  onChange={(date) => patch(index, { date })}
                  placeholder="Pilih tanggal"
                  className="h-12 rounded-full border-admin-line bg-admin-surface px-4 text-sm text-admin-ink"
                />
                <TimePicker
                  value={session.start}
                  onChange={(start) => patch(index, { start })}
                  placeholder="Jam mulai"
                  className="h-12 rounded-full border-admin-line bg-admin-surface px-4 text-sm text-admin-ink"
                />
                <TimePicker
                  value={session.end}
                  onChange={(end) => patch(index, { end })}
                  placeholder="Jam selesai"
                  className="h-12 rounded-full border-admin-line bg-admin-surface px-4 text-sm text-admin-ink"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...sessions, { date: "", start: "", end: "" }])}
            className={pillClass}
          >
            <Plus aria-hidden="true" size={16} strokeWidth={1.5} /> Tambah sesi
          </button>
        </>
      )}
    </div>
  );
}
