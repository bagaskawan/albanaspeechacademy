"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  articleBlocksToText,
  articleHasText,
  deriveExcerpt,
  normalizeArticleBlocks,
  splitTitleBlock,
  validateArticleMeta,
} from "@/lib/article-blocks";

export type SaveArticleInput = {
  slug: string | null;
  blocks: unknown;
  publish: boolean;
  expectedUpdatedAt: string | null;
};

export type SaveArticleResult =
  | { ok: true; slug: string; updatedAt: string; publishedAt: string | null }
  | { ok: false; error: string; fields?: Record<string, string>; conflict?: boolean };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function sameMoment(left: string, right: string) {
  return new Date(left).getTime() === new Date(right).getTime();
}

export async function saveArticleAction(input: SaveArticleInput): Promise<SaveArticleResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesi admin tidak ditemukan. Muat ulang halaman." };

  const { data: member } = await supabase.from("members").select("role").eq("id", user.id).maybeSingle();
  if (member?.role !== "admin") return { ok: false, error: "Halaman ini hanya untuk admin." };

  const normalized = normalizeArticleBlocks(input.blocks);
  if (normalized.error) return { ok: false, error: normalized.error };
  const split = splitTitleBlock(normalized.blocks ?? []);
  const { title, excerpt, fields } = validateArticleMeta(split.title, deriveExcerpt(split.blocks) || split.title);
  if (!articleHasText(split.blocks)) fields.blocks = "Isi artikel wajib diisi.";
  if (Object.keys(fields).length) return { ok: false, error: "Periksa kembali isian artikel.", fields };
  const blocks = split.blocks;

  const now = new Date().toISOString();
  const slug = input.slug?.trim() || null;
  if (slug && !SLUG_PATTERN.test(slug)) return { ok: false, error: "Slug artikel tidak valid." };

  const shared = {
    title,
    excerpt,
    body_blocks: blocks,
    body: articleBlocksToText(blocks),
    updated_at: now,
  };

  if (slug) {
    const { data: existing, error: readError } = await supabase
      .from("articles")
      .select("slug,published_at,updated_at")
      .eq("slug", slug)
      .maybeSingle();

    if (readError) return { ok: false, error: "Artikel tidak dapat dibaca. Coba lagi." };
    if (!existing) return { ok: false, error: "Artikel tidak ditemukan. Muat ulang daftar artikel." };
    if (input.expectedUpdatedAt && !sameMoment(existing.updated_at, input.expectedUpdatedAt)) {
      return { ok: false, conflict: true, error: "Artikel telah berubah di tab lain. Muat ulang halaman sebelum menyimpan lagi." };
    }

    const publishedAt = input.publish ? existing.published_at ?? now : existing.published_at;
    const { data: updated, error: updateError } = await supabase
      .from("articles")
      .update({ ...shared, published: input.publish, published_at: publishedAt })
      .eq("slug", slug)
      .eq("updated_at", existing.updated_at)
      .select("slug,updated_at,published_at")
      .maybeSingle();

    if (updateError) {
      console.error("Artikel gagal disimpan:", updateError.message);
      return { ok: false, error: "Perubahan artikel gagal disimpan. Periksa isian dan coba lagi." };
    }
    if (!updated) {
      return { ok: false, conflict: true, error: "Artikel telah berubah di tab lain. Muat ulang halaman sebelum menyimpan lagi." };
    }

    revalidatePath("/artikel");
    revalidatePath(`/artikel/${updated.slug}`);
    revalidatePath("/admin/artikel");
    revalidatePath(`/admin/artikel/${updated.slug}`);
    return { ok: true, slug: updated.slug, updatedAt: updated.updated_at, publishedAt: updated.published_at };
  }

  const { data: created, error: insertError } = await supabase
    .from("articles")
    .insert({ ...shared, published: input.publish, published_at: input.publish ? now : null })
    .select("slug,updated_at,published_at")
    .single();

  if (insertError) {
    console.error("Artikel gagal dibuat:", insertError.message);
    return { ok: false, error: "Artikel gagal dibuat. Periksa isian dan coba lagi." };
  }

  revalidatePath("/artikel");
  revalidatePath(`/artikel/${created.slug}`);
  revalidatePath("/admin/artikel");
  return { ok: true, slug: created.slug, updatedAt: created.updated_at, publishedAt: created.published_at };
}
