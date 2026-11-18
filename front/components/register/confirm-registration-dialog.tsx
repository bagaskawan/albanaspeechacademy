"use client";

import { useEffect, useId, useRef } from "react";

export function ConfirmRegistrationDialog({
  open,
  rows,
  submitting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  rows: { label: string; value: string }[];
  submitting: boolean;
  onCancel(): void;
  onConfirm(): void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    if (!submitting) onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] max-w-full rounded-sm border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-6 text-[var(--tone-ink)] shadow-xl backdrop:bg-black/50 sm:p-7"
    >
      <h3 id={titleId} className="type-title text-xl font-bold">
        Apakah data Anda sudah yakin?
      </h3>
      <p className="type-small mt-2 text-[var(--tone-muted)]">
        Periksa kembali data berikut. Instruksi pembayaran akan dikirim ke email di bawah. Setelah dikirim, data tidak
        bisa diubah sendiri dan pendaftaran baru dengan email/WhatsApp ini ditahan 30 menit.
      </p>

      <dl className="mt-5 divide-y divide-[var(--tone-rule)] border-y border-[var(--tone-rule)] text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
            <dt className="text-[var(--tone-muted)]">{row.label}</dt>
            <dd className="min-w-0 break-words text-right font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          autoFocus
          disabled={submitting}
          onClick={onCancel}
          className="type-small inline-flex min-h-11 cursor-pointer items-center rounded-xs border border-[var(--tone-rule)] bg-transparent px-5 py-2.5 font-display font-semibold text-[var(--tone-ink)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cek Lagi
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onConfirm}
          className="button-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Mengirim…" : "Yakin / Lanjut"}
        </button>
      </div>
    </dialog>
  );
}
