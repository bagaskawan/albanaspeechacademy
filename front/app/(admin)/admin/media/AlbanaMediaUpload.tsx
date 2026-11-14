"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AlbanaMediaUpload({ programs, batches }: { programs: { slug: string; title: string }[]; batches: { slug: string; title: string }[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return <form className="grid gap-4 rounded-xl border border-rule bg-card p-5" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unggahan gagal.");
      setMessage(`Media #${result.assetId} tersimpan sebagai draf. Terbitkan setelah memeriksa tampilannya.`);
      event.currentTarget.reset(); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unggahan gagal."); }
    finally { setBusy(false); }
  }}>
    <h2 className="text-lg font-semibold">Unggah gambar atau MP4</h2>
    <p className="text-sm text-muted">Gambar sumber maksimal 10 MiB, hasil maksimal 5 MiB. MP4 maksimal 25 MiB dan harus dikecilkan sebelum unggah.</p>
    <label className="grid gap-2 text-sm">Berkas<input name="file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4" required /></label>
    <label className="grid gap-2 text-sm">Program<select name="programSlug" required className="min-h-11 border border-rule bg-surface px-3"><option value="">Pilih program</option>{programs.map((program) => <option value={program.slug} key={program.slug}>{program.title}</option>)}</select></label>
    <label className="grid gap-2 text-sm">Batch (opsional)<select name="batchSlug" className="min-h-11 border border-rule bg-surface px-3"><option value="">Semua batch program</option>{batches.map((batch) => <option value={batch.slug} key={batch.slug}>{batch.title}</option>)}</select></label>
    <label className="grid gap-2 text-sm">Teks alternatif gambar<input name="altText" maxLength={500} className="min-h-11 border border-rule bg-surface px-3" placeholder="Jelaskan isi foto secara singkat" /></label>
    <button type="submit" disabled={busy} className="button-primary justify-self-start disabled:opacity-60">{busy ? "Mengunggah…" : "Unggah sebagai draf"}</button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </form>;
}
