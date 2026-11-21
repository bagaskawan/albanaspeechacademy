"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { AdminSheet } from "./AdminSheet";

type DeleteResult = void | { error?: string };

/**
 * Konfirmasi hapus admin: tetap terbuka dan mengunci tombol selama proses,
 * lalu menutup dengan toast sukses atau tetap terbuka dengan toast gagal.
 * `onConfirm` yang mengembalikan `{ error }` dianggap gagal; `void`/`{}` dianggap sukses.
 */
export function DeleteSheet({
  open,
  onOpenChange,
  title,
  description = "Tindakan ini tidak dapat dibatalkan.",
  confirmLabel = "Hapus",
  successMessage,
  errorMessage = "Gagal menghapus data. Coba lagi.",
  refresh = true,
  onConfirm,
  onSuccess,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  /** null = pemanggil sudah menampilkan toast sendiri. */
  successMessage: string | null;
  errorMessage?: string;
  refresh?: boolean;
  onConfirm: () => Promise<DeleteResult> | DeleteResult;
  onSuccess?: () => void;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function confirm() {
    if (pending) return;
    setPending(true);
    try {
      const result = await onConfirm();
      if (result && result.error) {
        toast.error(result.error);
        return;
      }
      if (successMessage) toast.success(successMessage);
      onOpenChange(false);
      onSuccess?.();
      if (refresh) router.refresh();
    } catch (error) {
      console.error("Hapus gagal", error);
      toast.error(errorMessage);
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminSheet
      open={open}
      onOpenChange={(next) => { if (!pending) onOpenChange(next); }}
      size="sm"
      tone="danger"
      icon={<Trash2 aria-hidden="true" size={20} strokeWidth={1.5} />}
      title={title}
      description={description}
      footer={
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-1"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={pending}
            aria-busy={pending}
            onClick={confirm}
            className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-admin-danger text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:flex-1"
          >
            {pending && <Loader2 aria-hidden="true" size={16} className="animate-spin" />}
            {pending ? "Menghapus…" : confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </AdminSheet>
  );
}
