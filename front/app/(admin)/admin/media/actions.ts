"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { youtubeVideoId } from "@/lib/youtube";

export async function saveMediaSettings(form: FormData) {
  await requireAdminMember();
  const fields = [
    ["albana_media_min_image_width", "imageWidth"],
    ["albana_media_min_image_height", "imageHeight"],
    ["albana_media_min_video_short_side", "videoShortSide"],
  ] as const;
  const values = fields.map(([key, name]) => ({ key, value: Number(form.get(name)) }));
  if (values.some(({ value }) => !Number.isInteger(value) || value < 320 || value > 8192)) throw new Error("Resolusi harus 320–8192 piksel.");
  const { error } = await academyBillingClient().from("system_settings").upsert(values.map(({ key, value }) => ({ key, value: String(value), updated_at: new Date().toISOString() })), { onConflict: "key" });
  if (error) throw new Error("Pengaturan media gagal disimpan.");
  revalidatePath("/admin/media");
}

export async function addYoutube(form: FormData) {
  await requireAdminMember();
  const id = youtubeVideoId(String(form.get("url") ?? ""));
  const programSlug = String(form.get("programSlug") ?? "");
  const batchSlug = String(form.get("batchSlug") ?? "").trim() || null;
  const description = String(form.get("description") ?? "").trim();
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(programSlug) || description.length > 500) throw new Error("Tautan YouTube atau program tidak valid.");
  const { error } = await academyBillingClient().from("media_assets").insert({ provider: "youtube", kind: "video",
    object_key: `https://www.youtube.com/watch?v=${id}`, alt_text: description || null,
    program_slug: programSlug, batch_slug: batchSlug, published: false });
  if (error) throw new Error("Tautan YouTube gagal disimpan.");
  revalidatePath("/admin/media");
}

export async function setMediaPublished(form: FormData) {
  await requireAdminMember();
  const id = Number(form.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Media tidak valid.");
  const published = form.get("published") === "true";
  const client = academyBillingClient();
  const { data: asset, error: readError } = await client.from("media_assets").select("kind,alt_text").eq("id", id).single();
  if (readError || !asset || published && asset.kind === "image" && !asset.alt_text) throw new Error("Gambar wajib memiliki teks alternatif.");
  const { error } = await client.from("media_assets").update({ published }).eq("id", id);
  if (error) throw new Error("Status media gagal diubah.");
  revalidatePath("/admin/media");
  revalidatePath("/program/[slug]", "page");
}
