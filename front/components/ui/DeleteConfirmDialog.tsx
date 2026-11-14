"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogIconHeader } from "@/components/ui/DialogIconHeader";
import { Button } from "@/components/ui/Button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmClassName?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Hapus",
  confirmClassName = "px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-full cursor-pointer h-auto border-0 shadow-sm"
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border-0 sm:border border-zinc-200 dark:border-zinc-800 p-6 rounded-none sm:rounded-[24px]">
        <DialogIconHeader icon={<Trash2 size={18} />} title={title} description={description} tone="red" />

        <div className="flex flex-row justify-end gap-3 pt-4 px-1">
          <Button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-full cursor-pointer h-auto shadow-none"
          >
            Batal
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={confirmClassName}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
