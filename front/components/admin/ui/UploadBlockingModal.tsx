"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

const emptySubscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

type UploadBlockingModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  current?: number;
  total?: number;
};

/**
 * Full-screen blurred blocking modal shown while images are uploading so the
 * user cannot close the parent dialog, navigate, or interact with other controls.
 */
export function UploadBlockingModal({
  open,
  title = "Mengunggah gambar…",
  description = "Mohon tunggu, jangan tutup jendela atau pindah halaman.",
  current,
  total,
}: UploadBlockingModalProps) {
  const mounted = useIsClient();

  if (!open || !mounted || typeof document === "undefined") return null;

  const hasProgress = typeof current === "number" && typeof total === "number" && total > 0;
  const percent = hasProgress ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(14,14,14,0.45)] p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-sm rounded-[28px] border border-admin-line bg-admin-canvas p-6 text-center shadow-[var(--admin-shadow-overlay)] sm:p-7">
        <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full bg-admin-ink text-admin-on-ink">
          <Loader2 aria-hidden="true" size={22} className="animate-spin" />
        </div>
        <h3 className="text-[17px] font-semibold text-admin-ink">{title}</h3>
        <p className="mt-1.5 text-[13px] text-admin-text-secondary">
          {hasProgress ? `Mengirim ${current} dari ${total} gambar ke penyimpanan…` : description}
        </p>
        {hasProgress && (
          <div className="mt-4 space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-admin-surface-muted">
              <div
                className="h-full rounded-full bg-admin-ink transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[11px] font-medium text-admin-text-secondary">{percent}%</p>
          </div>
        )}
        {hasProgress && (
          <p className="mt-3 text-[12px] text-admin-text-secondary">{description}</p>
        )}
      </div>
    </div>,
    document.body
  );
}
