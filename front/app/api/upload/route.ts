import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { MAX_IMAGE_SOURCE, MAX_VIDEO_SOURCE, prepareImage, readMp4Resolution } from "@/lib/media-prepare";

export const runtime = "nodejs";

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function minimums() {
  const keys = ["albana_media_min_image_width", "albana_media_min_image_height", "albana_media_min_video_short_side"];
  const { data, error } = await academyBillingClient().from("system_settings").select("key,value").in("key", keys);
  if (error) throw error;
  const values = Object.fromEntries((data ?? []).map((item) => [item.key, Number(item.value)]));
  const valid = (value: number, fallback: number) => Number.isInteger(value) && value >= 320 && value <= 8192 ? value : fallback;
  return { width: valid(values[keys[0]], 1280), height: valid(values[keys[1]], 720), video: valid(values[keys[2]], 720) };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try { if (new URL(origin).host !== new URL(request.url).host) return json({ error: "Asal permintaan tidak sah." }, 403); }
    catch { return json({ error: "Asal permintaan tidak sah." }, 403); }
  }
  if (Number(request.headers.get("content-length")) > MAX_VIDEO_SOURCE + 1024 * 1024) return json({ error: "Unggahan melebihi 25 MiB." }, 413);
  const session = await createClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return json({ error: "Masuk sebagai admin terlebih dahulu." }, 401);
  const { data: member } = await session.from("members").select("role").eq("id", user.id).maybeSingle();
  if (member?.role !== "admin") return json({ error: "Akses admin diperlukan." }, 403);

  let form: FormData;
  try { form = await request.formData(); }
  catch { return json({ error: "Formulir unggah tidak valid." }, 422); }
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "Pilih berkas gambar atau MP4." }, 422);
  const purpose = form.get("purpose") === "landing" ? "landing" : "program";
  const isVideo = file.type === "video/mp4";
  if (purpose === "landing" && isVideo) return json({ error: "Gambar diperlukan untuk halaman ini." }, 422);
  if (file.size < 1 || file.size > (isVideo ? MAX_VIDEO_SOURCE : MAX_IMAGE_SOURCE)) {
    return json({ error: isVideo ? "MP4 maksimal 25 MiB. Kecilkan sebelum mengunggah." : "Gambar sumber maksimal 10 MiB." }, 413);
  }
  if (!isVideo && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return json({ error: "Gunakan JPEG, PNG, atau WebP." }, 422);

  try {
    const min = await minimums();
    const source = Buffer.from(await file.arrayBuffer());
    let bytes: Buffer = source;
    let contentType = "video/mp4";
    if (isVideo) {
      const resolution = readMp4Resolution(source);
      if (!resolution) return json({ error: "MP4 tidak valid atau resolusinya tidak dapat dibaca." }, 422);
      if (Math.min(resolution.width, resolution.height) < min.video) return json({ error: `Video minimal ${min.video} piksel pada sisi pendek.` }, 422);
    } else {
      bytes = await prepareImage(source, min.width, min.height);
      contentType = "image/webp";
    }
    const storage = academyBillingClient();
    const bucket = purpose === "landing" ? "gallery" : "academy-media";
    const key = `${purpose === "landing" ? "landing" : "albana"}/${randomUUID()}.${isVideo ? "mp4" : "webp"}`;
    const { error: uploadError } = await storage.storage.from(bucket).upload(key, bytes, { contentType, upsert: false, cacheControl: "3600" });
    if (uploadError) throw uploadError;
    if (purpose === "landing") {
      return json({ url: storage.storage.from(bucket).getPublicUrl(key).data.publicUrl }, 200);
    }
    const programSlug = String(form.get("programSlug") ?? "").trim() || null;
    const batchSlug = String(form.get("batchSlug") ?? "").trim() || null;
    const altText = String(form.get("altText") ?? "").trim();
    if (!programSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(programSlug) || !isVideo && !altText || altText.length > 500) {
      await storage.storage.from(bucket).remove([key]);
      return json({ error: "Pilih program dan isi teks alternatif gambar." }, 422);
    }
    const { data, error } = await storage.from("media_assets").insert({ provider: "supabase_storage", kind: isVideo ? "video" : "image",
      object_key: key, alt_text: altText || null, program_slug: programSlug, batch_slug: batchSlug, published: false }).select("id").single();
    if (error || !data) {
      await storage.storage.from(bucket).remove([key]);
      throw error ?? new Error("Metadata media tidak tersimpan.");
    }
    return json({ assetId: data.id, url: `/api/media/${data.id}` }, 201);
  } catch (error) {
    if (error instanceof Error && /gambar|resolusi|format/i.test(error.message)) return json({ error: error.message }, 422);
    console.error("Unggah media gagal:", error);
    return json({ error: "Media belum bisa disimpan. Coba lagi nanti." }, 503);
  }
}
