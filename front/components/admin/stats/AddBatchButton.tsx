"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { ArrowRight, Award, BookOpen, CalendarPlus, Mic, Plus } from "lucide-react";
import { AdminSheet } from "@/components/admin/ui/AdminSheet";

export type QuickAddProgram = {
  slug: string;
  title: string;
};

const programIcons: Record<string, typeof BookOpen> = {
  "public-speaking-series": BookOpen,
  "public-speaking-for-speakers": Mic,
  "sertifikasi-pembicara-profesional": Award,
};

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";

export function AddBatchButton({ programs }: { programs: QuickAddProgram[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (programs.length === 0) return null;

  function chooseProgram(slug: string) {
    setOpen(false);
    router.push(`/admin/program/${encodeURIComponent(slug)}?addBatch=1`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-admin-ink px-5 text-[14px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft ${focusRing}`}
      >
        <Plus aria-hidden="true" size={16} strokeWidth={1.75} />
        <span>Tambah Batch</span>
      </button>

      <AdminSheet
        open={open}
        onOpenChange={setOpen}
        size="sm"
        icon={<CalendarPlus aria-hidden="true" size={20} strokeWidth={1.5} />}
        title="Tambah Batch"
        description="Pilih program untuk membuat batch baru."
        footer={
          <Dialog.Close
            type="button"
            className={`inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface ${focusRing}`}
          >
            Batal
          </Dialog.Close>
        }
      >
        <ul className="space-y-2.5">
          {programs.map((program) => {
            const Icon = programIcons[program.slug] ?? BookOpen;
            return (
              <li key={program.slug}>
                <button
                  type="button"
                  onClick={() => chooseProgram(program.slug)}
                  className={`group flex w-full cursor-pointer items-center gap-3.5 rounded-[20px] border border-admin-line bg-admin-surface px-4 py-3.5 text-left transition-colors hover:border-admin-line-strong hover:bg-admin-surface-muted ${focusRing}`}
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-admin-canvas text-admin-ink ring-1 ring-admin-line">
                    <Icon aria-hidden="true" size={18} strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-admin-ink">
                    {program.title}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    size={16}
                    strokeWidth={1.5}
                    className="shrink-0 text-admin-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-admin-ink"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </AdminSheet>
    </>
  );
}
