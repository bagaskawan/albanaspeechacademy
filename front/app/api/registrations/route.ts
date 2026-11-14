import { createHash, createHmac } from "node:crypto";
import { parseAcademySubmission } from "@/lib/academy-registration-input";
import { createReceiptToken } from "@/lib/receipt-token";
import { academyBillingClient } from "@/lib/server/academy-billing";

export const runtime = "nodejs";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return json({ message: "Kirim data dalam format JSON." }, 415);
  }
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return json({ message: "Asal permintaan tidak sah." }, 403);
    } catch { return json({ message: "Asal permintaan tidak sah." }, 403); }
  }
  const body = await request.text();
  if (body.length > 20_000) return json({ message: "Data formulir terlalu besar." }, 413);
  let raw: unknown;
  try { raw = JSON.parse(body); }
  catch { return json({ message: "Data formulir tidak valid." }, 422); }
  const submission = parseAcademySubmission(raw);
  if (!submission) return json({ message: "Periksa kembali data pendaftaran." }, 422);

  const secret = process.env.REGISTRATION_RECEIPT_SECRET;
  if (!secret) return json({ message: "Pendaftaran belum dikonfigurasi." }, 503);
  const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const sourceHash = createHmac("sha256", secret).update(source).digest("hex");
  const submissionHash = createHash("sha256").update(JSON.stringify(submission)).digest("hex");

  try {
    const client = academyBillingClient();
    const { data, error } = await client.rpc("receive_academy_registration", {
      request: { ...submission, sourceHash, submissionHash },
    });
    if (error) throw error;
    if (!data || typeof data !== "object") throw new Error("Respons database tidak valid.");
    const result = data as Record<string, unknown>;
    if (result.status === "changed") return json({ message: "Harga atau pilihan kelas berubah. Periksa kembali penawaran." }, 409);
    if (result.status === "unavailable") return json({ message: "Kelas atau rekening pembayaran belum tersedia." }, 409);
    if (result.status === "duplicate") return json({ message: "Pendaftaran untuk batch dan email ini sudah ada." }, 409);
    if (result.status === "busy") return json({ message: "Terlalu banyak pengiriman. Coba lagi sebentar." }, 429);
    if (result.status !== "received" || typeof result.registrationId !== "number" || typeof result.invoiceId !== "number") {
      throw new Error("Respons pendaftaran tidak valid.");
    }
    const receiptToken = createReceiptToken(result.registrationId, secret);
    return json({ registrationId: result.registrationId, invoiceId: result.invoiceId,
      receiptToken, redirectUrl: `/register/konfirmasi/${receiptToken}` }, 200);
  } catch (error) {
    console.error("Gagal menerima pendaftaran:", error);
    return json({ message: "Pendaftaran belum bisa diproses. Coba lagi nanti." }, 503);
  }
}
