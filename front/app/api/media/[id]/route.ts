import { createClient } from "@/lib/supabase/server";
import { academyBillingClient } from "@/lib/server/academy-billing";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d{0,14}$/.test(id)) return new Response(null, { status: 404 });
  const storage = academyBillingClient();
  const { data: asset, error } = await storage.from("media_assets").select("provider,object_key,published")
    .eq("id", Number(id)).maybeSingle();
  if (error || !asset || asset.provider !== "supabase_storage") return new Response(null, { status: 404 });
  if (!asset.published) {
    const session = await createClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) return new Response(null, { status: 404 });
    const { data: member } = await session.from("members").select("role").eq("id", user.id).maybeSingle();
    if (member?.role !== "admin") return new Response(null, { status: 404 });
  }
  const { data, error: signError } = await storage.storage.from("academy-media").createSignedUrl(asset.object_key, 60);
  if (signError || !data?.signedUrl) return new Response(null, { status: 503 });
  return new Response(null, { status: 302, headers: { Location: data.signedUrl, "Cache-Control": "no-store" } });
}
