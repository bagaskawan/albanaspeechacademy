import { NextResponse } from "next/server";
import { readAdminLiveCounts } from "@/lib/server/admin-live-counts";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Masuk sebagai admin terlebih dahulu." }, { status: 401 });
  }

  const { data: admin } = await session
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  }

  const counts = await readAdminLiveCounts();
  return NextResponse.json(counts, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
