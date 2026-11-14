"use client";

import { useState } from "react";

export function CopyAccountButton({ account }: { account: string }) {
  const [copied, setCopied] = useState(false);
  return <button type="button" className="button-secondary min-h-11" onClick={async () => {
    try { await navigator.clipboard.writeText(account); setCopied(true); }
    catch { setCopied(false); }
  }}>{copied ? "Tersalin" : "Salin nomor rekening"}</button>;
}
