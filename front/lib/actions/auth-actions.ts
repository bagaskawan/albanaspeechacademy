"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCookieDomain } from "@/lib/utils/url";

async function clearAllAuthCookies() {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const cookieDomain = getCookieDomain(host);
    const allCookies = cookieStore.getAll();

    const targetNames = new Set([
      ...allCookies.map((c) => c.name).filter((name) =>
        name.startsWith("sb-") ||
        name.includes("auth") ||
        name.includes("token") ||
        name.includes("session") ||
        name.includes("recovery")
      ),
      "sb-recovery-mode",
    ]);

    targetNames.forEach((name) => {
      cookieStore.set({
        name,
        value: "",
        maxAge: 0,
        path: "/",
      });
      if (cookieDomain) {
        cookieStore.set({
          name,
          value: "",
          maxAge: 0,
          path: "/",
          domain: cookieDomain,
        });
      }
    });
  } catch (_) { }
}

export async function signout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" }).catch(() => { });
  } catch (_) { }

  await clearAllAuthCookies();
  return { success: true };
}

export async function signInWithGoogle(_nextParam?: string) {
  return redirect("/login?error=" + encodeURIComponent("Login Google tidak didukung. Silakan masuk menggunakan akun admin Albana."));
}

export async function signInWithGithub() {
  return redirect("/login?error=" + encodeURIComponent("Login GitHub tidak didukung. Silakan masuk menggunakan akun admin Albana."));
}

export async function checkMemberEmailExistsAction(_email?: string) {
  return { exists: false, member: null };
}

export async function checkEmailExistsAction(_email?: string) {
  return false;
}

export async function checkWhatsappExistsAction(_whatsapp?: string) {
  return false;
}

export async function registerPriorityMemberAction(_onboardingData?: unknown) {
  return { success: false, error: "Fitur pendaftaran komunitas dinonaktifkan." };
}

export async function registerCollectionMemberAction(_onboardingData?: unknown) {
  return { success: false, error: "Fitur pendaftaran komunitas dinonaktifkan." };
}

export async function resetPasswordAction(_newPassword?: string) {
  return { success: false, error: "Fitur reset kata sandi dinonaktifkan." };
}

export async function checkRecoverySessionAction() {
  return { success: false, hasSession: false, session: null };
}
