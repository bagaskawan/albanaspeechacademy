"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await loginAdmin(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
      if (result.error) setError(result.error);
      else { router.replace("/admin"); router.refresh(); }
    } catch {
      setError("Gagal masuk. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-admin-canvas px-5 py-12 text-admin-ink">
    <div className="w-full max-w-md rounded-2xl border border-admin-line bg-admin-surface p-7 shadow-sm sm:p-9">
      <p className="text-sm font-bold tracking-widest text-admin-ink">ALBANA SPEECH ACADEMY</p>
      <h1 className="mt-5 text-3xl font-bold">Masuk ke CMS</h1>
      <p className="mt-2 text-sm text-admin-text-secondary">Masuk dengan username admin Albana. Email akun juga diterima.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm font-semibold">Username<input name="email" autoComplete="username" placeholder="adminalbana" autoCapitalize="none" spellCheck={false} required className="mt-2 min-h-11 w-full rounded-xl border border-admin-line bg-admin-surface-muted px-4 outline-none focus-visible:ring-2 focus-visible:ring-admin-ink" /></label>
        <label className="block text-sm font-semibold">Kata sandi<input name="password" type="password" autoComplete="current-password" required className="mt-2 min-h-11 w-full rounded-xl border border-admin-line bg-admin-surface-muted px-4 outline-none focus-visible:ring-2 focus-visible:ring-admin-ink" /></label>
        {error && <p role="alert" className="text-sm text-admin-danger">{error}</p>}
        <button disabled={pending} className="min-h-11 w-full rounded-xl bg-admin-ink px-5 font-semibold text-admin-on-ink hover:bg-admin-ink-soft disabled:opacity-60">{pending ? "Memeriksa…" : "Masuk"}</button>
      </form>
    </div>
  </main>;
}
