"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    setPending(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setMessage(error ? "Permintaan belum dapat dikirim. Coba lagi." : "Jika email terdaftar, tautan reset telah dikirim.");
    setPending(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-admin-surface-muted px-5 py-12 text-admin-ink">
    <div className="w-full max-w-md rounded-2xl border border-admin-line bg-admin-surface p-8">
      <h1 className="text-2xl font-bold">Atur ulang kata sandi</h1>
      <p className="mt-2 text-sm text-admin-text-secondary">Masukkan email admin Albana.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">Email<input type="email" name="email" autoComplete="email" required className="mt-2 min-h-11 w-full rounded-xl border border-admin-line bg-admin-surface-muted px-4 outline-none focus-visible:ring-2 focus-visible:ring-admin-ink" /></label>
        {message && <p role="status" className="text-sm">{message}</p>}
        <button disabled={pending} className="min-h-11 w-full rounded-xl bg-admin-ink px-5 font-semibold text-admin-on-ink disabled:opacity-60">{pending ? "Mengirim…" : "Kirim tautan"}</button>
      </form>
      <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-admin-ink">Kembali ke login</Link>
    </div>
  </main>;
}
