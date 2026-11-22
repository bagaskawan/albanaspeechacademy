"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { academyBillingClient } from "@/lib/server/academy-billing";
import {
  articleBlocksToText,
  articleHasText,
  collectArticleImageIds,
  deriveExcerpt,
  hasMissingImageAlt,
  normalizeArticleBlocks,
  splitTitleBlock,
  validateArticleMeta,
} from "@/lib/article-blocks";

export type SaveArticleInput = {
  slug: string | null;
  blocks: unknown;
  publish: boolean;
  expectedUpdatedAt: string | null;
  thumbnailImageId?: string | null;
};

export type SaveArticleResult =
  | { ok: true; slug: string; updatedAt: string; publishedAt: string | null }
  | { ok: false; error: string; fields?: Record<string, string>; conflict?: boolean };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SaveRpcRow = {
  ok?: boolean;
  error_code?: string;
  slug?: string;
  updated_at?: string;
  published_at?: string | null;
};

function mapRpcFailure(data: SaveRpcRow | null, fallback: string): SaveArticleResult {
  if (data?.error_code === "conflict") {
    return {
      ok: false,
      conflict: true,
      error: "Artikel telah berubah di tab lain. Muat ulang halaman sebelum menyimpan lagi.",
    };
  }
  if (data?.error_code === "not_found") {
    return { ok: false, error: "Artikel tidak ditemukan. Muat ulang daftar artikel." };
  }
  if (data?.error_code === "invalid_image") {
    return {
      ok: false,
      error: "Gambar tidak valid, belum siap, atau bukan milik artikel ini. Unggah ulang gambar.",
    };
  }
  return { ok: false, error: fallback };
}

async function requireAdminActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi admin tidak ditemukan. Muat ulang halaman." as const, userId: null };

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return { error: "Halaman ini hanya untuk admin." as const, userId: null };

  return { error: null, userId: user.id };
}

export async function saveArticleAction(input: SaveArticleInput): Promise<SaveArticleResult> {
  const actor = await requireAdminActor();
  if (actor.error || !actor.userId) {
    return { ok: false, error: actor.error ?? "Akses admin diperlukan." };
  }

  const normalized = normalizeArticleBlocks(input.blocks);
  if (normalized.error) return { ok: false, error: normalized.error };
  const split = splitTitleBlock(normalized.blocks ?? []);
  const { title, excerpt, fields } = validateArticleMeta(split.title, deriveExcerpt(split.blocks) || split.title);
  if (!title) fields.title = "Isi judul artikel.";
  if (!articleHasText(split.blocks)) fields.blocks = "Tulis minimal satu paragraf.";
  if (input.publish && hasMissingImageAlt(split.blocks)) {
    fields.alt = "Tambahkan teks alternatif untuk gambar ini.";
  }
  if (Object.keys(fields).length) {
    return { ok: false, error: "Periksa kembali isian artikel.", fields };
  }

  const blocks = split.blocks;
  const slug = input.slug?.trim() || null;
  if (slug && !SLUG_PATTERN.test(slug)) {
    return { ok: false, error: "Slug artikel tidak valid." };
  }

  const thumbnailImageId = input.thumbnailImageId?.trim() || null;
  if (thumbnailImageId && !UUID_PATTERN.test(thumbnailImageId)) {
    return { ok: false, error: "ID thumbnail tidak valid." };
  }

  const inlineImageIds = collectArticleImageIds(blocks);
  const service = academyBillingClient();
  const { data, error } = await service.rpc("save_article_with_images", {
    p_slug: slug,
    p_title: title,
    p_excerpt: excerpt,
    p_body_blocks: blocks,
    p_body: articleBlocksToText(blocks),
    p_publish: input.publish,
    p_expected_updated_at: input.expectedUpdatedAt,
    p_thumbnail_image_id: thumbnailImageId ? thumbnailImageId.toLowerCase() : null,
    p_inline_image_ids: inlineImageIds,
    p_actor_id: actor.userId,
  });

  if (error) {
    console.error("Artikel gagal disimpan:", error.message);
    return { ok: false, error: "Perubahan artikel gagal disimpan. Periksa isian dan coba lagi." };
  }

  const row = (data ?? null) as SaveRpcRow | null;
  if (!row?.ok || !row.slug || !row.updated_at) {
    return mapRpcFailure(row, "Perubahan artikel gagal disimpan. Periksa isian dan coba lagi.");
  }

  revalidatePath("/artikel");
  revalidatePath(`/artikel/${row.slug}`);
  revalidatePath("/admin/artikel");
  revalidatePath(`/admin/artikel/${row.slug}`);
  revalidatePath("/sitemap.xml");
  return {
    ok: true,
    slug: row.slug,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
  };
}

export async function unpublishArticleAction(
  slug: string,
  expectedUpdatedAt: string | null,
): Promise<SaveArticleResult> {
  const actor = await requireAdminActor();
  if (actor.error) return { ok: false, error: actor.error };
  if (!SLUG_PATTERN.test(slug)) return { ok: false, error: "Slug artikel tidak valid." };

  const service = academyBillingClient();
  const { data, error } = await service.rpc("set_article_published_status", {
    p_slug: slug,
    p_publish: false,
    p_expected_updated_at: expectedUpdatedAt,
  });

  if (error) {
    console.error("Artikel gagal ditarik dari publik:", error.message);
    return { ok: false, error: "Artikel gagal ditarik dari publik. Coba lagi." };
  }

  const row = (data ?? null) as SaveRpcRow | null;
  if (!row?.ok || !row.slug || !row.updated_at) {
    return mapRpcFailure(row, "Artikel gagal ditarik dari publik. Coba lagi.");
  }

  revalidatePath("/artikel");
  revalidatePath(`/artikel/${row.slug}`);
  revalidatePath("/admin/artikel");
  revalidatePath(`/admin/artikel/${row.slug}`);
  revalidatePath("/sitemap.xml");
  return {
    ok: true,
    slug: row.slug,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
  };
}

/** Row delete from the article list (plan 3.17). RLS also limits deletes to adminsuper. */
export async function deleteArticleAction(slug: string): Promise<{ error?: string }> {
  const { requireAdminMember } = await import("@/lib/server/admin-guard");
  await requireAdminMember("adminsuper");
  if (!SLUG_PATTERN.test(slug)) return { error: "Artikel tidak dikenal." };

  const service = academyBillingClient();
  const { data: deleted, error } = await service.rpc("delete_article_with_images", { p_slug: slug });
  if (error || !deleted) return { error: "Artikel gagal dihapus." };

  revalidatePath("/admin/artikel");
  revalidatePath("/artikel");
  revalidatePath(`/artikel/${slug}`);
  revalidatePath("/sitemap.xml");
  return {};
}
