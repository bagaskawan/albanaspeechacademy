"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, m, useDragControls } from "motion/react";
import { Dialog } from "radix-ui";
import { Loader2, X } from "lucide-react";
import { ease, transition } from "@/lib/motion/tokens";

// admin-ui-patterns §6.2: centred modal on desktop, bottom sheet below 640 px.
const SHEET_QUERY = "(max-width: 639px)";
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(SHEET_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useIsSheet = () => useSyncExternalStore(subscribe, () => window.matchMedia(SHEET_QUERY).matches, () => false);

const widths = { sm: "sm:max-w-[440px]", md: "sm:max-w-[560px]", lg: "sm:max-w-[720px]" } as const;
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";

export function FormDialog({
  open, onOpenChange, icon, title, description, size = "md", submitLabel, cancelLabel = "Batal", pending = false, onSubmit, children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  size?: keyof typeof widths;
  submitLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  const sheet = useIsSheet();
  const drag = useDragControls();

  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <AnimatePresence>
      {open && <Dialog.Portal forceMount key="form-dialog">
        <Dialog.Overlay asChild forceMount>
          <m.div className="fixed inset-0 z-50 bg-[rgba(14,14,14,0.45)] backdrop-blur-[4px]" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: transition.overlay }} exit={{ opacity: 0, transition: transition.exit }} />
        </Dialog.Overlay>
        <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <Dialog.Content asChild forceMount {...(description ? {} : { "aria-describedby": undefined })}>
            <m.div
              className={`pointer-events-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-admin-canvas shadow-[var(--admin-shadow-overlay)] sm:max-h-[min(760px,calc(100dvh-48px))] sm:rounded-[32px] ${widths[size]}`}
              initial={sheet ? { y: "100%" } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={sheet ? { y: 0, transition: { duration: 0.32, ease: ease.out } } : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: ease.out } }}
              exit={sheet ? { y: "100%", transition: transition.exit } : { opacity: 0, y: 8, scale: 0.98, transition: transition.exit }}
              drag={sheet ? "y" : false}
              dragListener={false}
              dragControls={drag}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) onOpenChange(false); }}
            >
              <form onSubmit={onSubmit} className="admin-form-plain flex min-h-0 flex-1 flex-col">
                {/* Sheet handle: drag it down to close (< 640 px). */}
                <div className="flex justify-center pt-3 sm:hidden" onPointerDown={(event) => drag.start(event)} style={{ touchAction: "none" }}>
                  <span aria-hidden="true" className="h-1 w-10 rounded-full bg-admin-line-strong" />
                </div>

                <div className="flex items-start gap-4 border-b border-admin-line px-5 pb-5 pt-4 sm:px-6 sm:pt-6">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0b0b0b] text-white">{icon}</span>
                  <div className="min-w-0 flex-1">
                    <Dialog.Title className="text-[18px] font-semibold leading-tight text-admin-ink sm:text-[20px]">{title}</Dialog.Title>
                    {description && <Dialog.Description className="mt-1 text-[14px] text-admin-text-secondary">{description}</Dialog.Description>}
                  </div>
                  <Dialog.Close aria-label="Tutup" className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-admin-line text-admin-text-secondary transition-colors hover:bg-admin-surface hover:text-admin-ink ${focusRing}`}>
                    <X aria-hidden="true" size={18} strokeWidth={1.5} />
                  </Dialog.Close>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>

                {/* Desktop: two equal pills, Batal left. Sheet: primary on top, both full width. */}
                <div className="flex flex-col-reverse gap-3 border-t border-admin-line px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] sm:flex-row sm:px-6 sm:pb-6">
                  <Dialog.Close type="button" className={`inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface ${focusRing}`}>
                    {cancelLabel}
                  </Dialog.Close>
                  <button type="submit" disabled={pending} className={`inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center gap-2 rounded-full bg-admin-ink text-[15px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft disabled:opacity-60 ${focusRing}`}>
                    {pending && <Loader2 aria-hidden="true" size={18} className="animate-spin" />}
                    {pending ? "Menyimpan…" : submitLabel}
                  </button>
                </div>
              </form>
            </m.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>}
    </AnimatePresence>
  </Dialog.Root>;
}
