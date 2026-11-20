"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyAccountButton({
  account,
  className = "",
}: {
  account: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className={`button-primary min-h-11 cursor-pointer transition-colors ${copied
        ? "border-[#16A34A] bg-[#16A34A]/10 text-[#15803D] dark:border-emerald-400/60 dark:bg-emerald-500/15 dark:text-emerald-300"
        : ""
        } ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(account);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Nomor rekening tersalin</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Salin nomor rekening</span>
        </>
      )}
    </button>
  );
}
