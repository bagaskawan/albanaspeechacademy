"use client";

import { useId } from "react";
import { Dialog } from "radix-ui";
import { Loader2 } from "lucide-react";
import { AdminSheet } from "@/components/admin/ui/AdminSheet";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink";

export function FormDialog({
  open,
  onOpenChange,
  icon,
  title,
  description,
  size = "md",
  submitLabel,
  cancelLabel = "Batal",
  pending = false,
  onSubmit,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  submitLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  const formId = useId();

  return (
    <AdminSheet
      open={open}
      onOpenChange={onOpenChange}
      icon={icon}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Dialog.Close
            type="button"
            className={`inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface ${focusRing}`}
          >
            {cancelLabel}
          </Dialog.Close>
          <button
            type="submit"
            form={formId}
            disabled={pending}
            className={`inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center gap-2 rounded-full bg-admin-ink text-[15px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft disabled:opacity-60 ${focusRing}`}
          >
            {pending && <Loader2 aria-hidden="true" size={18} className="animate-spin" />}
            {pending ? "Menyimpan…" : submitLabel}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit}>
        {children}
      </form>
    </AdminSheet>
  );
}
