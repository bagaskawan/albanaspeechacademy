import { academyBillingClient } from "@/lib/server/academy-billing";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[1-9]\d{0,14}$/.test(id)) {
    return new Response(null, { status: 404 });
  }

  const session = await createClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return new Response(null, { status: 404 });
  const { data: admin } = await session
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return new Response(null, { status: 404 });

  const storage = academyBillingClient();
  const { data: payment, error } = await storage
    .from("academy_invoice_payments")
    .select("proof_object_key")
    .eq("id", Number(id))
    .maybeSingle();
  if (error || !payment?.proof_object_key) {
    return new Response(null, { status: 404 });
  }

  const { data, error: signError } = await storage.storage
    .from("payment-proofs")
    .createSignedUrl(payment.proof_object_key, 60);
  if (signError || !data?.signedUrl) {
    return new Response(null, { status: 503 });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: data.signedUrl, "Cache-Control": "no-store" },
  });
}
