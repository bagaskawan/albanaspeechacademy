"use client";

import { useRouter } from "next/navigation";

/** Re-requests the current route so a failed catalog read can be retried. */
export function RetryButton({ label = "Coba lagi" }: { label?: string }) {
  const router = useRouter();
  return (
    <button className="button-secondary mt-5" type="button" onClick={() => router.refresh()}>
      {label}
    </button>
  );
}
