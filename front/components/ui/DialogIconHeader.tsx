import React from "react";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const tones = {
  sky: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
  red: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
} as const;

export function DialogIconHeader({
  icon,
  title,
  description,
  tone = "sky",
  className,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <DialogHeader
      className={cn("flex flex-row items-center gap-3 space-y-0 text-left pb-4", className)}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
          tones[tone]
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <DialogTitle className="text-base font-bold tracking-tight normal-case">
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-xs text-text-secondary mt-0.5">
            {description}
          </DialogDescription>
        )}
      </div>
    </DialogHeader>
  );
}
