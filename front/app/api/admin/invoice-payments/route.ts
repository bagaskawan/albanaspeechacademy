import { randomUUID } from "node:crypto";
import { parseRupiahInput } from "@/lib/billing";
import { MAX_IMAGE_SOURCE, prepareImage } from "@/lib/media-prepare";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { logAdminActivity } from "@/lib/server/admin-activity";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 6 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
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

  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return json({ error: "Ukuran unggahan maksimal 6 MiB." }, 413);
  }

  const session = await createClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return json({ error: "Masuk sebagai admin terlebih dahulu." }, 401);
  const { data: admin } = await session
    .from("admin_users")
    .select("user_id, role, username")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return json({ error: "Akses admin diperlukan." }, 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Formulir unggah tidak valid." }, 422);
  }

  const rawInvoiceId = Number(form.get("invoiceId"));
  if (!Number.isSafeInteger(rawInvoiceId) || rawInvoiceId < 1) {
    return json({ error: "Tagihan tidak valid." }, 422);
  }

  const amount = parseRupiahInput(String(form.get("amount") ?? ""));
  if (amount === null) {
    return json({ error: "Isi nominal transfer yang valid." }, 422);
  }

  const rawNote = form.get("note");
  const note = typeof rawNote === "string" ? rawNote.trim() : "";
  if (note.length > 300) {
    return json({ error: "Catatan maksimal 300 karakter." }, 422);
  }

  const proof = form.get("proof");
  if (!(proof instanceof File) || proof.size < 1) {
    return json({ error: "Lampirkan bukti transfer." }, 422);
  }
  if (proof.size > MAX_IMAGE_SOURCE) {
    return json({ error: "Ukuran gambar maksimal 10 MiB." }, 413);
  }
  if (!ALLOWED_MIME.has(proof.type)) {
    return json({ error: "Gunakan gambar JPEG, PNG, atau WebP." }, 415);
  }

  let bytes: Buffer;
  try {
    const source = Buffer.from(await proof.arrayBuffer());
    bytes = await prepareImage(source, 200, 200);
  } catch {
    return json({ error: "Bukti bukan gambar yang valid." }, 422);
  }

  const storage = academyBillingClient();
  const key = `invoice-${rawInvoiceId}/${randomUUID()}.webp`;

  try {
    const { error: uploadError } = await storage.storage
      .from("payment-proofs")
      .upload(key, bytes, { contentType: "image/webp", upsert: false });
    if (uploadError) throw uploadError;

    const { data: rpcData, error: rpcError } = await storage.rpc("record_invoice_payment", {
      target_invoice_id: rawInvoiceId,
      amount_idr: amount,
      proof_key: key,
      note: note || null,
      recorder: user.id,
    });
    if (rpcError) {
      await storage.storage.from("payment-proofs").remove([key]).catch(() => {});
      throw rpcError;
    }

    const result = rpcData as Record<string, unknown> | null;
    if (!result || result.status !== "recorded") {
      await storage.storage.from("payment-proofs").remove([key]).catch(() => {});
      if (result?.status === "changed") {
        return json({ error: "Tagihan sudah diproses." }, 409);
      }
      return json({ error: "Data catatan transfer tidak valid." }, 422);
    }

    await logAdminActivity({
      actor: {
        user_id: admin.user_id,
        username: admin.username ?? null,
        role: admin.role,
      },
      action: "create",
      module: "tagihan",
      entityId: rawInvoiceId,
      entityLabel: `Tagihan #${rawInvoiceId}`,
      summary: `Mencatat transfer Rp ${amount.toLocaleString("id-ID")} untuk tagihan #${rawInvoiceId}`,
      metadata: { amount, paymentId: result.paymentId },
    });

    return json(
      {
        paymentId: result.paymentId,
        paidTotalIdr: result.paidTotalIdr,
        balanceIdr: result.balanceIdr,
      },
      201,
    );
  } catch (error) {
    console.error("Gagal mencatat transfer", {
      invoiceId: rawInvoiceId,
      error: String(error instanceof Error ? error.message : error).slice(0, 300),
    });
    return json({ error: "Catatan transfer belum bisa disimpan." }, 503);
  }
}
