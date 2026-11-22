import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { academyBillingClient } from "@/lib/server/academy-billing";
import {
  createBlurDataUrl,
  MAX_IMAGE_SOURCE,
  MAX_VIDEO_SOURCE,
  prepareArticleImage,
  prepareImage,
  readMp4Resolution,
} from "@/lib/media-prepare";
import { photoLimitError, programBucket } from "@/lib/program-media";
import { deleteStorageFiles, parseStorageUrl } from "@/lib/supabase/storage-cleanup";

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
  const { data: admin } = await session.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return json({ error: "Akses admin diperlukan." }, 403);

  let form: FormData;
  try { form = await request.formData(); }
  catch { return json({ error: "Formulir unggah tidak valid." }, 422); }
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "Pilih berkas gambar atau MP4." }, 422);
  const rawPurpose = form.get("purpose");
  const purpose =
    rawPurpose === "landing"
      ? "landing"
      : rawPurpose === "legality"
        ? "legality"
        : rawPurpose === "article"
          ? "article"
          : "program";
  const isVideo = file.type === "video/mp4";
  if ((purpose === "landing" || purpose === "legality" || purpose === "article") && isVideo) {
    return json({ error: purpose === "article" ? "Gunakan gambar JPEG, PNG, atau WebP." : "Gambar diperlukan untuk halaman ini." }, 422);
  }
  if (file.size < 1 || file.size > (isVideo ? MAX_VIDEO_SOURCE : MAX_IMAGE_SOURCE)) {
    return json({
      error: isVideo
        ? "MP4 maksimal 25 MiB. Kecilkan sebelum mengunggah."
        : purpose === "article"
          ? "Ukuran gambar melebihi 10 MB. Pilih file lain."
          : "Gambar sumber maksimal 10 MiB.",
    }, 413);
  }
  if (!isVideo && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return json({ error: "Gunakan JPEG, PNG, atau WebP." }, 422);
  }

  try {
    if (purpose === "article") {
      const rawProfile = form.get("profile");
      if (rawProfile !== "thumbnail" && rawProfile !== "inline") {
        return json({ error: "Profil gambar artikel tidak valid." }, 422);
      }
      const source = Buffer.from(await file.arrayBuffer());
      const prepared = await prepareArticleImage(source, rawProfile);
      const storage = academyBillingClient();
      const id = randomUUID();
      const key = `${rawProfile}/${id}.webp`;

      const { error: insertErr } = await storage.from("article_images").insert({
        id,
        uploader_id: user.id,
        profile: rawProfile,
        object_key: key,
        mime_type: prepared.contentType,
        width: prepared.width,
        height: prepared.height,
        byte_size: prepared.bytes.length,
        ready_at: null,
      });
      if (insertErr) throw insertErr;

      const { error: uploadError } = await storage.storage
        .from("article-images")
        .upload(key, prepared.bytes, { contentType: prepared.contentType, upsert: false, cacheControl: "3600" });
      if (uploadError) {
        await storage.from("article_images").delete().eq("id", id);
        throw uploadError;
      }

      const { error: readyErr } = await storage
        .from("article_images")
        .update({ ready_at: new Date().toISOString() })
        .eq("id", id);
      if (readyErr) {
        await storage.storage.from("article-images").remove([key]).catch(() => {});
        throw readyErr;
      }

      return json(
        {
          id,
          url: `/api/article-images/${id}`,
          width: prepared.width,
          height: prepared.height,
        },
        201,
      );
    }

    const min = await minimums();
    const source = Buffer.from(await file.arrayBuffer());
    let bytes: Buffer = source;
    let contentType = "video/mp4";
    let blurDataUrl: string | null = null;
    if (isVideo) {
      const resolution = readMp4Resolution(source);
      if (!resolution) return json({ error: "MP4 tidak valid atau resolusinya tidak dapat dibaca." }, 422);
      if (Math.min(resolution.width, resolution.height) < min.video) return json({ error: `Video minimal ${min.video} piksel pada sisi pendek.` }, 422);
    } else {
      bytes = purpose === "legality"
        ? await prepareImage(source, 320, 320)
        : await prepareImage(source, 0, 0);
      contentType = "image/webp";
      if (purpose === "program") {
        blurDataUrl = await createBlurDataUrl(bytes);
      }
    }
    const storage = academyBillingClient();
    const programSlug = purpose === "program" ? String(form.get("programSlug") ?? "").trim() || null : null;
    const batchSlug = purpose === "program" ? String(form.get("batchSlug") ?? "").trim() || null : null;
    const altText = purpose === "program" ? String(form.get("altText") ?? "").trim() : "";
    const rawReplaceId = purpose === "program" ? String(form.get("replaceAssetId") ?? "").trim() : "";
    const replaceAssetId = rawReplaceId ? Number(rawReplaceId) : null;
    const bucket = purpose === "landing" ? "gallery" : purpose === "legality" ? "legality" : programBucket(programSlug);

    let existingAsset: { id: number; object_key: string | null; alt_text: string | null; program_slug: string | null; kind: string; provider: string } | null = null;

    if (purpose === "program") {
      if (!programSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(programSlug) || (!isVideo && !altText && !replaceAssetId) || altText.length > 500) {
        return json({ error: "Pilih program dan isi teks alternatif gambar." }, 422);
      }
      if (replaceAssetId !== null) {
        if (!Number.isInteger(replaceAssetId) || replaceAssetId <= 0 || isVideo) {
          return json({ error: "Target foto pengganti tidak valid." }, 422);
        }
        const { data: found, error: findErr } = await storage
          .from("media_assets")
          .select("id, object_key, alt_text, program_slug, kind, provider")
          .eq("id", replaceAssetId)
          .maybeSingle();
        if (findErr || !found || found.program_slug !== programSlug || found.kind !== "image") {
          return json({ error: "Foto yang akan diganti tidak ditemukan." }, 404);
        }
        existingAsset = found;
      } else if (!isVideo) {
        const { count, error: countError } = await storage
          .from("media_assets")
          .select("id", { count: "exact", head: true })
          .eq("program_slug", programSlug)
          .eq("kind", "image");
        if (countError) throw countError;
        const limitErr = photoLimitError(count ?? 0, 1);
        if (limitErr) return json({ error: limitErr }, 409);
      }
    }

    const keyPrefix = purpose === "landing" ? "landing" : purpose === "legality" ? "legality" : "albana";
    const key = `${keyPrefix}/${randomUUID()}.${isVideo ? "mp4" : "webp"}`;
    const { error: uploadError } = await storage.storage.from(bucket).upload(key, bytes, { contentType, upsert: false, cacheControl: "3600" });
    if (uploadError) throw uploadError;
    if (purpose === "landing" || purpose === "legality") {
      return json({ url: storage.storage.from(bucket).getPublicUrl(key).data.publicUrl }, 200);
    }

    if (existingAsset) {
      const { error: updateError } = await storage
        .from("media_assets")
        .update({
          provider: "supabase_storage",
          object_key: key,
          alt_text: altText || existingAsset.alt_text,
          blur_data_url: blurDataUrl,
          consent_at: new Date().toISOString(),
        })
        .eq("id", existingAsset.id);
      if (updateError) {
        await storage.storage.from(bucket).remove([key]);
        throw updateError;
      }
      if (existingAsset.provider === "supabase_storage" && existingAsset.object_key) {
        await storage.storage.from(bucket).remove([existingAsset.object_key]).catch(() => {});
        if (bucket !== "academy-media") {
          await storage.storage.from("academy-media").remove([existingAsset.object_key]).catch(() => {});
        }
      }
      return json({ assetId: existingAsset.id, url: `/api/media/${existingAsset.id}?t=${Date.now()}` }, 200);
    }

    const { data, error } = await storage.from("media_assets").insert({ provider: "supabase_storage", kind: isVideo ? "video" : "image",
      object_key: key, alt_text: altText || null, blur_data_url: blurDataUrl, program_slug: programSlug, batch_slug: batchSlug, published: true, consent_at: new Date().toISOString() }).select("id").single();
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

const CLEANABLE_BUCKETS = new Set(["gallery", "legality"]);

export async function DELETE(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try { if (new URL(origin).host !== new URL(request.url).host) return json({ error: "Asal permintaan tidak sah." }, 403); }
    catch { return json({ error: "Asal permintaan tidak sah." }, 403); }
  }
  const session = await createClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return json({ error: "Masuk sebagai admin terlebih dahulu." }, 401);
  const { data: admin } = await session.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return json({ error: "Akses admin diperlukan." }, 403);

  const body = (await request.json().catch(() => null)) as { urls?: unknown } | null;
  const rawUrls = Array.isArray(body?.urls) ? body.urls.filter((u): u is string => typeof u === "string") : [];
  const safeUrls = rawUrls.filter((url) => {
    const parsed = parseStorageUrl(url);
    return parsed !== null && CLEANABLE_BUCKETS.has(parsed.bucket);
  });
  if (safeUrls.length === 0) return json({ deleted: 0 }, 200);

  const result = await deleteStorageFiles(academyBillingClient(), safeUrls);
  return json({ deleted: result.deleted.length }, 200);
}
