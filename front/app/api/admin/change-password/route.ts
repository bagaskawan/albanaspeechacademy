import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { createClient } from "@/lib/supabase/server";
import { getCookieDomain } from "@/lib/utils/url";

export const runtime = "nodejs";

const MIN_PASSWORD_LENGTH = 8;

function cleanEnv(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function createStatelessAuthClient() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/+$/, "");
  const anonKey = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY);
  if (!url || !anonKey) {
    throw new Error("Konfigurasi autentikasi Supabase belum lengkap.");
  }
  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return json({ error: "Asal permintaan tidak sah." }, 403);
      }
    } catch {
      return json({ error: "Asal permintaan tidak sah." }, 403);
    }
  }

  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) return json({ error: "Sesi berakhir. Silakan masuk kembali." }, 401);

  const { data: admin } = await session
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return json({ error: "Akses admin diperlukan." }, 403);

  let payload: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object") {
      return json({ error: "Permintaan tidak valid." }, 422);
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Permintaan tidak valid." }, 422);
  }

  const currentPassword = typeof payload.currentPassword === "string" ? payload.currentPassword : "";
  const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";
  const confirmPassword = typeof payload.confirmPassword === "string" ? payload.confirmPassword : "";

  if (!currentPassword) {
    return json({ error: "Password saat ini wajib diisi." }, 400);
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return json({ error: `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter.` }, 400);
  }
  if (newPassword !== confirmPassword) {
    return json({ error: "Verifikasi password baru tidak cocok." }, 400);
  }
  if (newPassword === currentPassword) {
    return json({ error: "Password baru harus berbeda dari password saat ini." }, 400);
  }

  const adminClient = academyBillingClient();
  let email = user.email ?? null;
  if (!email) {
    try {
      const { data } = await adminClient.auth.admin.getUserById(user.id);
      email = data.user?.email ?? null;
    } catch {
      email = null;
    }
  }
  if (!email) {
    return json({ error: "Akun tidak dapat diverifikasi. Coba masuk ulang." }, 400);
  }

  // Verifikasi password saat ini lewat klien stateless agar sesi tidak terganggu bila salah.
  try {
    const verifier = createStatelessAuthClient();
    const { error: verifyError } = await verifier.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (verifyError) {
      return json({ error: "Password saat ini tidak sesuai." }, 400);
    }
  } catch {
    return json({ error: "Gagal memverifikasi password saat ini. Coba lagi." }, 500);
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (updateError) {
    return json({ error: "Password belum bisa diperbarui. Coba lagi." }, 500);
  }

  // Cabut seluruh sesi agar pengguna wajib masuk ulang dengan password baru.
  await session.auth.signOut({ scope: "global" }).catch(() => {});

  const response = json({ ok: true }, 200);
  const host = request.headers.get("host") || "";
  const cookieDomain = getCookieDomain(host);
  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.startsWith("sb-")) continue;
    response.cookies.set(cookie.name, "", { path: "/", maxAge: 0 });
    if (cookieDomain) {
      response.cookies.set(cookie.name, "", { path: "/", domain: cookieDomain, maxAge: 0 });
    }
  }

  return response;
}
