import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/utils/url";

export async function GET(request: Request) {
  const origin = getPublicOrigin(request);
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Login Google tidak didukung. Silakan masuk menggunakan akun admin Albana.")}`
  );
}
