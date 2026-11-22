#!/usr/bin/env node
/**
 * Pembersihan gambar artikel yang gagal/batal diunggah atau sudah terlepas >= 7 hari.
 * Default berjalan dalam mode dry-run; jalankan dengan `--execute` untuk menghapus.
 */

import { createClient } from "@supabase/supabase-js";

const execute = process.argv.includes("--execute");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const STALE_UPLOAD_MS = 60 * 60 * 1000; // 1 jam
const DETACHED_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

async function findCandidates() {
  const staleBefore = new Date(Date.now() - STALE_UPLOAD_MS).toISOString();
  const detachedBefore = new Date(Date.now() - DETACHED_RETENTION_MS).toISOString();

  const { data: unready, error: err1 } = await supabase
    .from("article_images")
    .select("id, object_key, article_slug, ready_at, detached_at, created_at")
    .is("ready_at", null)
    .is("cleanup_claimed_at", null)
    .lt("created_at", staleBefore)
    .limit(200);
  if (err1) throw err1;

  const { data: detached, error: err2 } = await supabase
    .from("article_images")
    .select("id, object_key, article_slug, ready_at, detached_at, created_at")
    .not("detached_at", "is", null)
    .is("cleanup_claimed_at", null)
    .lt("detached_at", detachedBefore)
    .limit(200);
  if (err2) throw err2;

  const map = new Map();
  for (const row of [...(unready ?? []), ...(detached ?? [])]) {
    map.set(row.id, row);
  }
  return [...map.values()];
}

async function isStillReferenced(imageId) {
  const { data: thumbRefs, error: err1 } = await supabase
    .from("articles")
    .select("slug")
    .eq("thumbnail_image_id", imageId)
    .limit(1);
  if (err1) throw err1;
  if (thumbRefs && thumbRefs.length > 0) return true;

  const { data: blockRefs, error: err2 } = await supabase
    .from("articles")
    .select("slug")
    .ilike("body_blocks::text", `%/api/article-images/${imageId}%`)
    .limit(1);
  if (err2) {
    // Fallback jika filter cast jsonb tidak didukung PostgREST di versi tertentu: periksa manual.
    const { data: allArticles, error: err3 } = await supabase.from("articles").select("slug, body_blocks");
    if (err3) throw err3;
    return (allArticles ?? []).some((a) =>
      JSON.stringify(a.body_blocks ?? []).toLowerCase().includes(`/api/article-images/${imageId.toLowerCase()}`),
    );
  }
  return Boolean(blockRefs && blockRefs.length > 0);
}

async function main() {
  const candidates = await findCandidates();
  console.log(`Mode: ${execute ? "EXECUTE" : "DRY-RUN"} | Kandidat ditemukan: ${candidates.length}`);

  if (!candidates.length) return;
  if (!execute) {
    for (const item of candidates) {
      console.log(`- [dry-run] ${item.id} (${item.object_key}) | detached_at=${item.detached_at ?? "null"}`);
    }
    return;
  }

  let deleted = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of candidates) {
    const claimAt = new Date().toISOString();
    const { data: claimed, error: claimErr } = await supabase
      .from("article_images")
      .update({ cleanup_claimed_at: claimAt })
      .eq("id", item.id)
      .is("cleanup_claimed_at", null)
      .select("id, object_key")
      .maybeSingle();

    if (claimErr || !claimed) {
      skipped += 1;
      continue;
    }

    try {
      const referenced = await isStillReferenced(claimed.id);
      if (referenced) {
        await supabase
          .from("article_images")
          .update({ cleanup_claimed_at: null, detached_at: null })
          .eq("id", claimed.id);
        skipped += 1;
        continue;
      }

      const { error: removeErr } = await supabase.storage.from("article-images").remove([claimed.object_key]);
      if (removeErr) throw removeErr;

      const { error: delRowErr } = await supabase.from("article_images").delete().eq("id", claimed.id);
      if (delRowErr) throw delRowErr;

      deleted += 1;
      console.log(`- [deleted] ${claimed.id} (${claimed.object_key})`);
    } catch (err) {
      failed += 1;
      console.error(`- [failed] ${claimed.id}:`, err instanceof Error ? err.message : err);
      await supabase.from("article_images").update({ cleanup_claimed_at: null }).eq("id", claimed.id);
    }
  }

  console.log(`Selesai: deleted=${deleted}, skipped=${skipped}, failed=${failed}`);
}

main().catch((err) => {
  console.error("Pembersihan gagal:", err);
  process.exit(1);
});
