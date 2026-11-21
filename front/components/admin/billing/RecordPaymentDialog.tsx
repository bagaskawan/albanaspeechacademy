"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseRupiahInput, paymentBalance } from "@/lib/billing";
import { compressImage } from "@/lib/file-compress";
import { UploadBlockingModal } from "@/components/admin/ui/UploadBlockingModal";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function RecordPaymentDialog({
  invoiceId,
  invoiceNumber,
  totalIdr,
  recordedIdr,
  open,
  onOpenChange,
  title = "Catat transfer masuk",
}: {
  invoiceId: number;
  invoiceNumber: string;
  totalIdr: number;
  recordedIdr: number[];
  open: boolean;
  onOpenChange(open: boolean): void;
  title?: string;
}) {
  const router = useRouter();
  const amountId = useId();
  const noteId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [amountInput, setAmountInput] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function resetForm() {
    setAmountInput("");
    setNote("");
    setFile(null);
    setFileError(null);
    setSubmitError(null);
    setDragging(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (submitting) return;
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  function acceptFile(candidate: File | undefined) {
    if (!candidate) return;
    if (!ALLOWED_TYPES.has(candidate.type)) {
      setFileError("Gunakan gambar JPEG, PNG, atau WebP.");
      return;
    }
    if (candidate.size < 1 || candidate.size > MAX_SOURCE_BYTES) {
      setFileError("Ukuran gambar maksimal 10 MiB.");
      return;
    }
    setFileError(null);
    setSubmitError(null);
    setFile(candidate);
  }

  const beforeSummary = paymentBalance(totalIdr, recordedIdr);
  const parsedAmount = parseRupiahInput(amountInput);
  const afterSummary =
    parsedAmount !== null ? paymentBalance(totalIdr, [...recordedIdr, parsedAmount]) : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const amount = parseRupiahInput(amountInput);
    if (amount === null) {
      setSubmitError("Isi nominal ditransfer yang valid (bilangan bulat positif).");
      return;
    }
    if (!file) {
      setFileError("Lampirkan bukti transfer terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const compressed = await compressImage(file);
      const body = new FormData();
      body.set("invoiceId", String(invoiceId));
      body.set("amount", String(amount));
      if (note.trim()) body.set("note", note.trim());
      body.set("proof", compressed);

      const response = await fetch("/api/admin/invoice-payments", {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setSubmitError(payload.error || "Gagal menyimpan catatan transfer.");
        return;
      }

      toast.success("Transfer tercatat");
      resetForm();
      onOpenChange(false);
      router.refresh();
    } catch {
      setSubmitError("Gagal terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {invoiceNumber} · Total {rupiah(totalIdr)}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-1.5 rounded-[16px] border border-admin-line bg-admin-surface p-3.5 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-admin-text-secondary">Total tagihan</dt>
            <dd className="font-mono font-medium tabular-nums text-admin-ink">{rupiah(totalIdr)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-admin-text-secondary">Sudah tercatat</dt>
            <dd className="font-mono font-medium tabular-nums text-admin-ink">{rupiah(beforeSummary.paidIdr)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-admin-line pt-1.5 font-semibold">
            <dt className="text-admin-text-secondary">Sisa sebelum catatan ini</dt>
            <dd className="font-mono tabular-nums text-admin-ink">{rupiah(beforeSummary.balanceIdr)}</dd>
          </div>
        </dl>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={amountId} className="block text-[13px] font-medium text-admin-ink">
                Nominal ditransfer <span className="text-admin-danger">*</span>
              </label>
              {beforeSummary.balanceIdr > 0 && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setAmountInput(new Intl.NumberFormat("id-ID").format(beforeSummary.balanceIdr));
                    setSubmitError(null);
                  }}
                  className="cursor-pointer text-[12px] font-medium text-admin-text-secondary underline-offset-2 hover:text-admin-ink hover:underline disabled:opacity-50"
                >
                  Isi sisa ({rupiah(beforeSummary.balanceIdr)})
                </button>
              )}
            </div>
            <div className="relative mt-1.5">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-mono text-[13px] font-semibold text-admin-text-secondary select-none"
              >
                Rp
              </span>
              <input
                id={amountId}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                disabled={submitting}
                value={amountInput}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setAmountInput(digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "");
                  setSubmitError(null);
                }}
                placeholder="0"
                className="h-11 w-full rounded-full border border-admin-line-strong bg-admin-canvas !pl-11 pr-4 font-mono text-[15px] font-semibold tabular-nums text-admin-ink placeholder:font-normal placeholder:text-admin-text-faint focus:border-admin-ink focus:outline-none"
              />
            </div>
            {afterSummary && (
              <p
                className={`mt-1.5 text-[12px] font-medium ${afterSummary.state === "short"
                    ? "text-admin-danger"
                    : afterSummary.state === "exact"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
              >
                {afterSummary.state === "short"
                  ? `Kurang ${rupiah(afterSummary.balanceIdr)}`
                  : afterSummary.state === "exact"
                    ? "Pas, siap diverifikasi"
                    : `Lebih ${rupiah(-afterSummary.balanceIdr)} — kembalikan selisih manual`}
              </p>
            )}
          </div>

          <div>
            <span className="block text-[13px] font-medium text-admin-ink">
              Bukti transfer <span className="text-admin-danger">*</span>
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const chosen = e.target.files?.[0];
                e.target.value = "";
                acceptFile(chosen);
              }}
            />

            {file && previewUrl ? (
              <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-admin-line bg-admin-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Pratinjau bukti transfer"
                  className="size-14 shrink-0 rounded-lg border border-admin-line object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-admin-ink">{file.name}</p>
                  <p className="text-[12px] text-admin-text-secondary">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-admin-line bg-admin-canvas px-2.5 text-[12px] font-medium text-admin-ink hover:bg-admin-surface"
                  >
                    <RefreshCw size={12} aria-hidden="true" />
                    Ganti
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setFile(null);
                      setFileError(null);
                    }}
                    aria-label="Hapus bukti"
                    className="inline-flex size-8 items-center justify-center rounded-full border border-admin-line bg-admin-canvas text-admin-danger hover:bg-admin-rose-soft"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={submitting ? -1 : 0}
                onClick={() => {
                  if (!submitting) inputRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (!submitting && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!submitting) setDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!submitting) setDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragging(false);
                  if (!submitting) acceptFile(e.dataTransfer.files?.[0]);
                }}
                className={`mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-5 text-center transition-colors ${dragging
                    ? "border-admin-ink bg-admin-surface"
                    : "border-admin-line-strong bg-admin-canvas hover:bg-admin-surface"
                  }`}
              >
                <UploadCloud size={20} className="text-admin-text-secondary" aria-hidden="true" />
                <p className="text-[13px] font-medium text-admin-ink">
                  Seret gambar ke sini atau pilih dari perangkat
                </p>
                <p className="text-[11px] text-admin-text-secondary">JPEG, PNG, atau WebP (maks. 10 MiB)</p>
              </div>
            )}

            {fileError && <p className="mt-1.5 text-[12px] text-admin-danger">{fileError}</p>}
          </div>

          <div>
            <label htmlFor={noteId} className="block text-[13px] font-medium text-admin-ink">
              Catatan <span className="text-admin-text-secondary">(opsional)</span>
            </label>
            <input
              id={noteId}
              type="text"
              maxLength={300}
              disabled={submitting}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="mis. transfer kedua via BCA mobile"
              className="mt-1.5 h-10 w-full rounded-xl border border-admin-line bg-admin-canvas px-3 text-[13px] text-admin-ink focus:border-admin-ink focus:outline-none"
            />
          </div>

          {submitError && (
            <p role="alert" className="rounded-xl border border-admin-danger/30 bg-admin-rose-soft px-3 py-2 text-[12px] text-admin-danger">
              {submitError}
            </p>
          )}

          <DialogFooter className="gap-2 pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-admin-line px-4 text-[13px] font-medium text-admin-ink hover:bg-admin-surface disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-full bg-admin-ink px-5 text-[13px] font-medium text-admin-on-ink hover:bg-admin-ink-soft disabled:opacity-60"
            >
              {submitting ? "Menyimpan…" : "Simpan catatan"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>

      <UploadBlockingModal open={submitting} title="Mengunggah bukti transfer…" />
    </Dialog>
  );
}
