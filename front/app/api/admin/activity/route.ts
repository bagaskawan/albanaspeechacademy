import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_ACTIVITY_ACTIONS,
  logAdminActivity,
  type AdminActivityAction,
} from "@/lib/server/admin-activity";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
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
  if (!user) return json({ error: "Masuk sebagai admin terlebih dahulu." }, 401);

  const { data: admin } = await session
    .from("admin_users")
    .select("user_id, role, username")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return json({ error: "Akses admin diperlukan." }, 403);

  let payload: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json({ error: "Payload tidak valid." }, 422);
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Payload tidak valid." }, 422);
  }

  const action = typeof payload.action === "string" ? payload.action : "";
  if (!ADMIN_ACTIVITY_ACTIONS.has(action as AdminActivityAction)) {
    return json({ error: "Jenis aksi tidak valid." }, 422);
  }

  const moduleName = typeof payload.module === "string" ? payload.module.trim() : "";
  if (!moduleName || moduleName.length > 64) {
    return json({ error: "Nama modul wajib diisi (maksimal 64 karakter)." }, 422);
  }

  const summary = typeof payload.summary === "string" ? payload.summary.trim() : "";
  if (!summary || summary.length > 300) {
    return json({ error: "Ringkasan aktivitas wajib diisi (maksimal 300 karakter)." }, 422);
  }

  const rawEntityId = payload.entityId;
  let entityId: string | null = null;
  if (typeof rawEntityId === "string" && rawEntityId.trim()) {
    entityId = rawEntityId.trim().slice(0, 120);
  } else if (typeof rawEntityId === "number" && Number.isFinite(rawEntityId)) {
    entityId = String(rawEntityId).slice(0, 120);
  }

  const rawEntityLabel = payload.entityLabel;
  const entityLabel =
    typeof rawEntityLabel === "string" && rawEntityLabel.trim()
      ? rawEntityLabel.trim().slice(0, 160)
      : null;

  const rawMetadata = payload.metadata;
  const metadata =
    rawMetadata && typeof rawMetadata === "object" && !Array.isArray(rawMetadata)
      ? (rawMetadata as Record<string, unknown>)
      : undefined;

  await logAdminActivity({
    actor: {
      user_id: admin.user_id,
      username: admin.username ?? null,
      role: admin.role,
    },
    action: action as AdminActivityAction,
    module: moduleName,
    entityId,
    entityLabel,
    summary,
    metadata,
  });

  return json({ ok: true }, 201);
}
