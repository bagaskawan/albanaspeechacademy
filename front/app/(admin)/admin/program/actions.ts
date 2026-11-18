"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { BUNDLE_SLUG, CERTIFICATION_SLUG, INHOUSE_SLUG, SERIES_SLUG, SPEAKER_SLUG, bundlePriceValid } from "@/lib/bundle";
import { toStoredSessions, validateSessions, type SessionInput } from "@/lib/program-batch";
import { videoLimitError, programBucket } from "@/lib/program-media";
import { youtubeVideoId } from "@/lib/youtube";

const PUBLIC_TRAINING: readonly string[] = [SERIES_SLUG, SPEAKER_SLUG, CERTIFICATION_SLUG];
const ALL_PROGRAMS: readonly string[] = [...PUBLIC_TRAINING, INHOUSE_SLUG];

function revalidate() {
  revalidatePath("/admin/program");
  revalidatePath("/", "layout");
}

/**
 * Batch hanya menyimpan nama, jadwal, dan sakelar buka. `is_active` tidak pernah
 * dikirim: trigger `batches_single_open` menyamakannya dengan `registration_open`
 * dan menutup batch lain pada program yang sama.
 */
export async function saveBatch(input: {
  slug: string | null;
  programSlug: string;
  title: string;
  sessions: SessionInput[];
  open: boolean;
}): Promise<{ error?: string }> {
  const supabase = await requireAdminMember();
  if (!PUBLIC_TRAINING.includes(input.programSlug)) return { error: "Program tidak valid." };
  const title = input.title.trim();
  if (!title || title.length > 160) return { error: "Nama batch wajib diisi." };
  const sessionError = validateSessions(input.sessions);
  if (sessionError) return { error: sessionError };

  if (input.open) {
    const { data: program } = await supabase.from("programs").select("price_idr").eq("slug", input.programSlug).maybeSingle();
    if (!program || !(Number(program.price_idr) > 0)) {
      return { error: "Isi biaya program dulu sebelum membuka pendaftaran." };
    }
  }

  const sessions = toStoredSessions(input.sessions);
  const { error } = input.slug
    ? await supabase.from("batches").update({ title, sessions, registration_open: input.open })
        .eq("slug", input.slug).eq("program_slug", input.programSlug)
    : await supabase.from("batches").insert({ program_slug: input.programSlug, title, sessions, registration_open: input.open });
  if (error) return { error: "Batch belum bisa disimpan. Periksa nama dan jadwalnya." };
  revalidate();
  return {};
}

export async function deleteBatch(slug: string): Promise<{ error?: string }> {
  // Hapus hanya untuk adminsuper, seperti deletePartner dan deleteArticleAction;
  // tombolnya memang disembunyikan di UI, tetapi aksi server tetap harus memeriksa.
  const supabase = await requireAdminMember("adminsuper");
  // Menghapus batch berpendaftar akan memutus butir pendaftaran dan tagihannya.
  const { count, error: countError } = await academyBillingClient()
    .from("academy_registration_items").select("registration_id", { count: "exact", head: true }).eq("batch_slug", slug);
  if (countError) return { error: "Pendaftar batch ini belum bisa diperiksa." };
  if ((count ?? 0) > 0) return { error: "Batch yang sudah punya pendaftar tidak bisa dihapus." };

  const { error } = await supabase.from("batches").delete().eq("slug", slug);
  if (error) return { error: "Batch belum bisa dihapus." };
  revalidate();
  return {};
}

/** Satu baris penawaran untuk pasangan Speaker <-> Sertifikasi; admin hanya mengisi harga paket. */
export async function saveBundle(input: {
  active: boolean;
  priceIdr: number;
  dpPercent: number | null;
  description: string;
}): Promise<{ error?: string }> {
  await requireAdminMember();
  const client = academyBillingClient();
  if (!Number.isSafeInteger(input.priceIdr) || input.priceIdr <= 0) return { error: "Harga paket wajib diisi." };
  if (input.dpPercent !== null && (!Number.isInteger(input.dpPercent) || input.dpPercent < 1 || input.dpPercent > 99)) {
    return { error: "DP paket harus 1–99%." };
  }
  const description = input.description.trim();
  if (description.length > 300) return { error: "Penjelasan paket maksimal 300 karakter." };

  // Harga hanya diperiksa saat tawaran dinyalakan, supaya admin selalu bisa mematikannya.
  if (input.active) {
    const { data: programs, error: readError } = await client.from("programs").select("slug,price_idr").in("slug", [SPEAKER_SLUG, CERTIFICATION_SLUG]);
    if (readError || !programs) return { error: "Biaya program belum bisa dibaca." };
    const price = (slug: string) => Number(programs.find((row) => row.slug === slug)?.price_idr);
    if (!bundlePriceValid(input.priceIdr, price(SPEAKER_SLUG), price(CERTIFICATION_SLUG))) {
      return { error: "Harga paket harus lebih besar dari biaya tiap program dan lebih kecil dari jumlah keduanya." };
    }
  }

  const { error } = await client.from("bundle_offers").upsert({
    slug: BUNDLE_SLUG,
    title: "Paket Speaker + Sertifikasi",
    speaker_program_slug: SPEAKER_SLUG,
    certification_program_slug: CERTIFICATION_SLUG,
    price_idr: input.priceIdr,
    dp_percent: input.dpPercent,
    description: description || null,
    active: input.active,
    show_on_speaker: input.active,
    show_on_certification: input.active,
    placement_scope: "program",
    updated_at: new Date().toISOString(),
  }, { onConflict: "slug" });
  if (error) return { error: "Paket belum bisa disimpan." };
  revalidate();
  return {};
}

export async function addProgramVideo(input: {
  programSlug: string;
  url: string;
  title: string;
}): Promise<{ error?: string }> {
  await requireAdminMember();
  if (!ALL_PROGRAMS.includes(input.programSlug)) return { error: "Program tidak valid." };
  const url = input.url.trim();
  const title = input.title.trim();
  if (!youtubeVideoId(url)) return { error: "Masukkan tautan YouTube yang sah (https://youtu.be/... atau youtube.com)." };
  if (!title || title.length > 160) return { error: "Judul video wajib diisi (maksimal 160 karakter)." };

  const client = academyBillingClient();
  const { count, error: countError } = await client
    .from("media_assets")
    .select("id", { count: "exact", head: true })
    .eq("program_slug", input.programSlug)
    .eq("kind", "video");
  if (countError) return { error: "Jumlah video program belum bisa diperiksa." };
  const limitErr = videoLimitError(count ?? 0);
  if (limitErr) return { error: limitErr };

  const { error } = await client.from("media_assets").insert({
    provider: "youtube",
    kind: "video",
    object_key: url,
    alt_text: title,
    program_slug: input.programSlug,
    batch_slug: null,
    published: true,
    consent_at: new Date().toISOString(),
  });
  if (error) return { error: "Video belum bisa ditambahkan." };
  revalidate();
  return {};
}

export async function removeProgramMedia(id: number): Promise<{ error?: string }> {
  await requireAdminMember("adminsuper");
  if (!Number.isInteger(id) || id <= 0) return { error: "Media tidak valid." };
  const client = academyBillingClient();
  const { data: row, error: readError } = await client
    .from("media_assets")
    .select("id, provider, object_key, program_slug")
    .eq("id", id)
    .maybeSingle();
  if (readError || !row) return { error: "Media tidak ditemukan." };

  if (row.provider === "supabase_storage" && row.object_key) {
    const bucket = programBucket(row.program_slug);
    await client.storage.from(bucket).remove([row.object_key]);
    if (bucket !== "academy-media") {
      await client.storage.from("academy-media").remove([row.object_key]);
    }
  }
  const { error } = await client.from("media_assets").delete().eq("id", id);
  if (error) return { error: "Media belum bisa dihapus." };
  revalidate();
  return {};
}

export async function removeMultipleProgramMedia(ids: number[]): Promise<{ error?: string }> {
  await requireAdminMember("adminsuper");
  const validIds = Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0)));
  if (validIds.length === 0) return { error: "Pilih media yang akan dihapus." };

  const client = academyBillingClient();
  const { data: rows, error: readError } = await client
    .from("media_assets")
    .select("id, provider, object_key, program_slug")
    .in("id", validIds);
  if (readError || !rows || rows.length === 0) return { error: "Media tidak ditemukan." };

  const bucketPaths = new Map<string, string[]>();
  for (const row of rows) {
    if (row.provider === "supabase_storage" && row.object_key) {
      const bucket = programBucket(row.program_slug);
      bucketPaths.set(bucket, [...(bucketPaths.get(bucket) ?? []), row.object_key]);
      if (bucket !== "academy-media") {
        bucketPaths.set("academy-media", [...(bucketPaths.get("academy-media") ?? []), row.object_key]);
      }
    }
  }
  for (const [bucket, paths] of bucketPaths.entries()) {
    if (paths.length > 0) {
      await client.storage.from(bucket).remove(paths).catch(() => {});
    }
  }

  const { error } = await client.from("media_assets").delete().in("id", validIds);
  if (error) return { error: "Media belum bisa dihapus." };
  revalidate();
  return {};
}
