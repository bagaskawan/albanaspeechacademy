"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPasswordAction } from "@/lib/actions/auth-actions";
import { createClient } from "@/lib/supabase/client";
import { clearStaleAuthStorage } from "@/lib/utils/url";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Eye, EyeOff, Shield, User } from "lucide-react";
import { isDedicatedAdmin } from "@/lib/constants";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectToParam = searchParams.get("redirectTo");
  const messageParam = searchParams.get("message");
  const errorParam = searchParams.get("error");

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleRedirectUrls, setRoleRedirectUrls] = useState<{
    adminUrl: string;
    memberUrl: string;
  } | null>(null);

  const computeRedirectUrls = (needsOnboarding = false) => {
    // Gunakan NEXT_PUBLIC_ADMIN_URL dari env jika tersedia,
    // jika tidak, selalu gunakan path /admin (single-domain, bukan subdomain)
    const adminRedirectUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "/admin";

    let userRedirectUrl = "/myprofile";
    if (needsOnboarding) {
      userRedirectUrl = "/myprofile/onboarding";
    }

    const memberUrl = redirectToParam ? redirectToParam : userRedirectUrl;

    return { adminUrl: adminRedirectUrl, memberUrl };
  };

  useEffect(() => {
    // Bersihkan token basi di localStorage/sessionStorage agar tidak ada konflik multi-akun
    clearStaleAuthStorage();

    // Jika dialihkan dari callback Google dengan query roleSelect=1
    const checkRoleSelect = async () => {
      if (searchParams.get("roleSelect") === "1") {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: member } = await supabase
              .from("members")
              .select("role, username")
              .eq("id", user.id)
              .maybeSingle();

            const urls = computeRedirectUrls(false);

            const isRootAdmin =
              isDedicatedAdmin(member?.username) ||
              isDedicatedAdmin(user.email);

            // root admin langsung masuk ke admin dashboard
            if (isRootAdmin) {
              window.location.href = urls.adminUrl;
              return;
            }

            if (member && member.role === "admin") {
              setRoleRedirectUrls(urls);
              setShowRoleModal(true);
            }
          }
        } catch (err) {
          console.error("Error checking role select:", err);
        }
      }
    };

    checkRoleSelect();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signInWithPasswordAction(emailOrUsername, password);
      if (result.success) {
        const urls = computeRedirectUrls(result.needsOnboarding);

        const isRootAdmin =
          result.isDedicatedAdmin ||
          isDedicatedAdmin(emailOrUsername) ||
          isDedicatedAdmin(result.username);

        // Khusus root admin langsung ke dashboard admin tanpa modal role
        if (isRootAdmin) {
          window.location.href = urls.adminUrl;
          return;
        }

        // Jika user adalah admin lainnya, tampilkan modal pilihan role
        if (result.isAdmin) {
          setRoleRedirectUrls(urls);
          setShowRoleModal(true);
          setIsLoading(false);
          return;
        }

        // Jika member biasa, langsung redirect ke member URL
        window.location.href = urls.memberUrl;
      } else {
        setError(result.error || "Terjadi kesalahan saat masuk.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Login client error:", err);
      setError("Gagal terhubung ke server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans selection:bg-black selection:text-white bg-[#F9F9F9] dark:bg-[#121212] text-[#0A0A0A] dark:text-white overflow-x-hidden">
      {/* Centered Branding & Form */}
      <div className="w-full max-w-sm px-6 py-10 flex flex-col justify-between text-[#0A0A0A] dark:text-white">
        {/* Logo */}
        <BrandLogo className="h-14 mb-6" />

        {/* Branding & Form Area */}
        <div className="w-full py-6">

          {messageParam && (
            <div className="my-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 text-[11px] text-emerald-800 dark:text-emerald-300 font-mono flex items-start gap-2 rounded-none animate-fade-in">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
              <div className="flex-1">
                <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                  SUCCESS
                </span>
                {messageParam}
              </div>
            </div>
          )}

          {(error || errorParam) && (
            <div className="my-4 p-3 bg-red-50 dark:bg-red-950/20 border-l-4 border-[#bc151b] text-[11px] text-[#bc151b] dark:text-red-400 font-mono flex items-start gap-2 rounded-none">
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                  ERROR_DETECTED
                </span>
                {error || errorParam}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                EMAIL ATAU USERNAME
              </label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="name@domain.com atau username"
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                KATA SANDI
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 pr-8 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650 text-[#0A0A0A] dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[9px] font-mono tracking-wider uppercase text-zinc-400">
              <Link href="/forgot-password" className="hover:text-black dark:hover:text-white transition-colors">
                LUPA KATA SANDI?
              </Link>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-8 py-3 bg-accent-strong text-white hover:bg-[#bc151b] font-bold text-[11px] uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <>MASUK &rarr;</>
                )}
              </button>

              {/* <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-black dark:text-white font-bold hover:text-[#bc151b] dark:hover:text-[#bc151b] underline transition-colors"
                >
                  Daftar di sini
                </Link>
              </p> */}
            </div>
          </form>
        </div>

        {/* Footer Branding & Socials */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] text-zinc-400 font-mono tracking-wider uppercase gap-4 mt-6 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL PILIH ROLE: ADMIN ATAU MEMBER */}
      {showRoleModal && roleRedirectUrls && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-left relative animate-scale-up">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
                [ KONFIRMASI AKSES MASUK ]
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
                Masuk Sebagai Apa?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Akun Anda terdaftar memiliki wewenang <strong>Admin</strong> serta profil <strong>Member</strong>. Silakan pilih ruang kerja yang ingin Anda tuju:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {/* Option 1: Admin */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = roleRedirectUrls.adminUrl;
                }}
                className="w-full p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500 text-left transition-all group cursor-pointer flex items-center justify-between shadow-2xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>Dashboard Admin</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-black">
                        OPERATOR
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      Kelola member, transaksi, konten, & sistem
                    </p>
                  </div>
                </div>
                <span className="text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all text-sm shrink-0 ml-2 font-mono">
                  &rarr;
                </span>
              </button>

              {/* Option 2: Member */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = roleRedirectUrls.memberUrl;
                }}
                className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 text-left transition-all group cursor-pointer flex items-center justify-between shadow-2xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>Area Member</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono font-black">
                        KREATOR
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      Buka profil saya, portofolio, dan daftar event
                    </p>
                  </div>
                </div>
                <span className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all text-sm shrink-0 ml-2 font-mono">
                  &rarr;
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
