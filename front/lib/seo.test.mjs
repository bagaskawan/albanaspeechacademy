import assert from "node:assert/strict";
import test from "node:test";
import {
  HOME_OG_IMAGE,
  SITE_URL,
  buildArticleJsonLd,
  buildArticleSeoImage,
  deriveArticleSeoDescription,
  serializeJsonLd,
} from "./seo.ts";

test("SEO artikel memakai fallback ringkasan dan gambar ketika kosong", () => {
  assert.equal(deriveArticleSeoDescription("  Ringkasan artikel  ", "Isi panjang"), "Ringkasan artikel");
  assert.equal(
    deriveArticleSeoDescription("", "# Judul\n\nParagraf pembuka artikel lama."),
    "Judul Paragraf pembuka artikel lama.",
  );

  const fallbackImg = buildArticleSeoImage(null);
  assert.equal(fallbackImg.url, `${SITE_URL}${HOME_OG_IMAGE.url}`);
  assert.equal(fallbackImg.width, 1200);

  const thumbId = "550e8400-e29b-41d4-a716-446655440000";
  const thumbImg = buildArticleSeoImage(thumbId);
  assert.equal(thumbImg.url, `${SITE_URL}/api/article-images/${thumbId}`);
  assert.equal(thumbImg.width, 480);
  assert.equal(thumbImg.height, 360);
});

test("JSON-LD BlogPosting men-escape karakter berbahaya dan memuat canonical", () => {
  const jsonLd = buildArticleJsonLd({
    slug: "latihan-vokal",
    title: "Latihan <script>Vokal",
    description: "Ringkasan",
    publishedAt: "2026-11-22T00:00:00.000Z",
    updatedAt: "2026-11-22T01:00:00.000Z",
    thumbnailImageId: null,
  });

  assert.equal(jsonLd["@type"], "BlogPosting");
  assert.equal(jsonLd.mainEntityOfPage["@id"], `${SITE_URL}/artikel/latihan-vokal`);
  assert.equal(jsonLd.datePublished, "2026-11-22T00:00:00.000Z");

  const serialized = serializeJsonLd(jsonLd);
  assert.ok(!serialized.includes("<script>"));
  assert.ok(serialized.includes("\\u003cscript>"));
});
