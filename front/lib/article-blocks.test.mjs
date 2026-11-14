import assert from "node:assert/strict";
import test from "node:test";
import {
  articleBlocksToText,
  articleHasText,
  deriveExcerpt,
  legacyBodyToBlocks,
  normalizeArticleBlocks,
  safeArticleHref,
  splitTitleBlock,
  titleBlock,
} from "./article-blocks.ts";

const blocks = [
  { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Judul bagian", styles: { bold: true } }] },
  { type: "paragraph", content: [{ type: "text", text: "Kalimat " }, { type: "link", href: "https://contoh.id", content: [{ type: "text", text: "tautan" }] }] },
  { type: "bulletListItem", content: [{ type: "text", text: "Poin" }], children: [{ type: "bulletListItem", content: [{ type: "text", text: "Anak" }] }] },
];

test("blok yang didukung dinormalisasi dan diproyeksikan ke teks", () => {
  const result = normalizeArticleBlocks(blocks);
  assert.equal(result.error, null);
  assert.equal(result.blocks?.length, 3);
  assert.ok(articleHasText(result.blocks ?? []));
  const text = articleBlocksToText(result.blocks ?? []);
  assert.match(text, /^## Judul bagian/);
  assert.match(text, /- Poin/);
  assert.match(text, /- Anak/);
});

test("tipe blok, tautan, dan kedalaman di luar dukungan ditolak", () => {
  assert.ok(normalizeArticleBlocks([{ type: "image", props: { url: "https://contoh.id/a.png" } }]).error);
  assert.ok(normalizeArticleBlocks([{ type: "paragraph", content: [{ type: "link", href: "javascript:alert(1)", content: [] }] }]).error);
  assert.equal(safeArticleHref("javascript:alert(1)"), null);
  assert.equal(safeArticleHref("mailto:halo@contoh.id"), "mailto:halo@contoh.id");

  let deep = [{ type: "bulletListItem", content: [{ type: "text", text: "0" }] }];
  for (let index = 1; index <= 5; index += 1) {
    deep = [{ type: "bulletListItem", content: [{ type: "text", text: String(index) }], children: deep }];
  }
  assert.ok(normalizeArticleBlocks(deep).error);
});

test("artikel lama dikonversi ke blok dan tetap terbaca tanpa body_blocks", () => {
  const legacy = "# Bagian\n\nParagraf pertama.\n\n- Satu\n- Dua";
  const converted = legacyBodyToBlocks(legacy);
  assert.equal(converted[0].type, "heading");
  assert.equal(converted[0].props.level, 1);
  assert.equal(converted[1].type, "paragraph");
  assert.equal(converted[2].type, "bulletListItem");
  assert.equal(normalizeArticleBlocks(null).blocks, null);
});

test("baris pertama menjadi judul dan sisa blok menjadi isi", () => {
  const split = splitTitleBlock([
    { type: "paragraph", content: [{ type: "text", text: "  Judul Artikel  " }] },
    { type: "paragraph", content: [{ type: "text", text: "Paragraf pembuka." }] },
    { type: "bulletListItem", content: [{ type: "text", text: "Poin" }] },
  ]);
  assert.equal(split.title, "Judul Artikel");
  assert.equal(split.blocks.length, 2);
  assert.equal(deriveExcerpt(split.blocks), "Paragraf pembuka.");

  const withSeed = [titleBlock("Judul Artikel"), ...split.blocks];
  assert.deepEqual(splitTitleBlock(withSeed), split);
  assert.deepEqual(splitTitleBlock([]), { title: "", blocks: [] });
  assert.equal(deriveExcerpt([{ type: "paragraph", content: [] }]), "");
});
