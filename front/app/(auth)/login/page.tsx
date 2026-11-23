"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { loginAdmin } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("passwordChanged") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotice("Password berhasil diperbarui. Silakan masuk kembali dengan password baru.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
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
    <div className="w-full max-w-md rounded-2xl border border-admin-line p-7 shadow-sm sm:p-9">
      <span className="academy-hero-logo-blue block aspect-[120/46] h-8 dark:hidden" role="img" aria-label="Albana Speech Academy" />
      <BrandLogo src="/logo-white.png" imageClassName="object-contain" sizes="104px" className="hidden h-8 dark:block" />
      <h1 className="mt-5 text-3xl font-bold">Selamat datang kembali.</h1>
      {error && <p role="alert" className="mt-4 rounded-xl bg-admin-rose-soft px-4 py-3 text-sm text-admin-danger">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-admin-mint-soft px-4 py-3 text-sm text-admin-mint-ink">{notice}</p>}
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm font-semibold">Username atau email<input name="email" autoComplete="username" placeholder="username" autoCapitalize="none" spellCheck={false} required className="mt-2 min-h-11 w-full rounded-xl border border-admin-line bg-admin-surface-muted px-4 outline-none focus-visible:ring-2 focus-visible:ring-admin-ink" /></label>
        <label className="block text-sm font-semibold">Kata sandi<input name="password" type="password" autoComplete="current-password" placeholder="*******" required className="mt-2 min-h-11 w-full rounded-xl border border-admin-line bg-admin-surface-muted px-4 outline-none focus-visible:ring-2 focus-visible:ring-admin-ink" /></label>
        <button disabled={pending} className="min-h-11 w-full rounded-xl bg-admin-ink px-5 font-semibold text-admin-on-ink hover:bg-admin-ink-soft disabled:opacity-60">{pending ? "Memeriksa…" : "Masuk"}</button>
      </form>
    </div>
    <ThemeToggle className="fixed right-5 bottom-5 z-50 inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-admin-line-strong bg-admin-surface text-admin-ink shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-admin-surface-muted active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink sm:right-6 sm:bottom-6" />
  </main>;
}
