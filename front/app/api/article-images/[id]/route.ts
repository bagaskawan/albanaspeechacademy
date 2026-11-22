import { createClient } from "@/lib/supabase/server";
import { academyBillingClient } from "@/lib/server/academy-billing";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return new Response(null, { status: 404 });
  }

  const storage = academyBillingClient();
  const { data: asset, error } = await storage
    .from("article_images")
    .select("id, uploader_id, article_slug, object_key, mime_type, ready_at, detached_at, cleanup_claimed_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !asset || !asset.ready_at || asset.cleanup_claimed_at || asset.detached_at) {
    return new Response(null, { status: 404 });
  }

  let isPublic = false;
  if (asset.article_slug) {
    const { data: article } = await storage
      .from("articles")
      .select("published")
      .eq("slug", asset.article_slug)
      .maybeSingle();
    isPublic = article?.published === true;
  }

  if (!isPublic) {
    const session = await createClient();
    const {
      data: { user },
    } = await session.auth.getUser();
    if (!user) return new Response(null, { status: 404 });

    const { data: admin } = await session
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!admin) return new Response(null, { status: 404 });

    if (!asset.article_slug && asset.uploader_id !== user.id) {
      return new Response(null, { status: 404 });
    }
  }

  const { data: blob, error: downloadError } = await storage.storage
    .from("article-images")
    .download(asset.object_key);

  if (downloadError || !blob) {
    return new Response(null, { status: 503 });
  }

  const bytes = await blob.arrayBuffer();
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": asset.mime_type || "image/webp",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
