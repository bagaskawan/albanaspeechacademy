"use client";

import { X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MotionProvider } from "@/components/motion/MotionProvider";

type MediaModalProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  headerLeft: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onKeyDown?: (event: KeyboardEvent) => void;
  returnFocusTo?: React.RefObject<HTMLButtonElement | null>;
};

export function MediaModal({
  open,
  onClose,
  ariaLabel,
  headerLeft,
  children,
  footer,
  onKeyDown,
  returnFocusTo,
}: MediaModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const returnTarget = returnFocusTo?.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      onKeyDown?.(event);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      requestAnimationFrame(() => returnTarget?.focus());
    };
  }, [open, onClose, onKeyDown, returnFocusTo]);

  return (
    <MotionProvider>
      <AnimatePresence>
        {open ? (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => {
              if (event.target === event.currentTarget) onClose();
            }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#070f1c]/80 backdrop-blur-xs sm:items-center sm:p-6"
          >
            <m.div
              initial={{ y: isMobile ? "100%" : 28, opacity: isMobile ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: isMobile ? "100%" : 28, opacity: isMobile ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              drag={isMobile ? "y" : false}
              dragDirectionLock
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.55 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90 || info.velocity.y > 450) {
                  onClose();
                }
              }}
              className="tone-canvas flex min-h-[72dvh] max-h-[94dvh] w-full flex-col justify-between overflow-hidden rounded-none border-t border-[var(--tone-rule)] bg-[var(--tone-bg)] text-[var(--tone-ink)] shadow-2xl sm:min-h-0 sm:max-w-4xl sm:rounded-xs sm:border"
            >
              {/* Drag handle (mobile) + top header */}
              <div className="shrink-0 border-b border-[var(--tone-rule)]">
                <div className="flex justify-center pt-2.5 pb-1 sm:hidden" aria-hidden="true">
                  <span className="h-1 w-10 bg-[var(--tone-rule)]" />
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-5 sm:py-3">
                  <div className="flex min-w-0 items-center gap-2.5">{headerLeft}</div>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup modal"
                    className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-none border border-[var(--tone-rule)] bg-[var(--tone-tile)] text-[var(--tone-ink)] transition-colors hover:border-[var(--tone-accent)] hover:text-[var(--tone-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] sm:rounded-xs"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Media stage */}
              <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0d1829]">
                {children}
              </div>

              {/* Footer */}
              {footer ? (
                <div className="shrink-0 border-t border-[var(--tone-rule)] bg-[var(--tone-bg)] p-4 sm:px-5 sm:py-4">
                  {footer}
                </div>
              ) : null}
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </MotionProvider>
  );
}
