import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { MAX_IMAGE_SOURCE, prepareArticleImage, prepareImage, readMp4Resolution } from "./media-prepare.ts";

test("gambar HD diubah ke WebP tanpa memperbesar dimensi", async () => {
  const source = await sharp({ create: { width: 1280, height: 720, channels: 3, background: "#7b5a39" } }).png().toBuffer();
  const result = await prepareImage(source, 1280, 720);
  const metadata = await sharp(result).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1280);
  assert.equal(metadata.height, 720);
  assert.ok(result.length <= 5 * 1024 * 1024);
  await assert.rejects(() => prepareImage(source, 1920, 1080));
});

test("gambar resolusi & orientasi bebas lolos jika batas minimal 0", async () => {
  const portrait = await sharp({ create: { width: 480, height: 800, channels: 3, background: "#7b5a39" } }).png().toBuffer();
  const outPortrait = await prepareImage(portrait, 0, 0);
  const metaPortrait = await sharp(outPortrait).metadata();
  assert.equal(metaPortrait.format, "webp");
  assert.equal(metaPortrait.width, 480);
  assert.equal(metaPortrait.height, 800);

  const smallLandscape = await sharp({ create: { width: 640, height: 480, channels: 3, background: "#7b5a39" } }).png().toBuffer();
  const outLandscape = await prepareImage(smallLandscape, 0, 0);
  const metaLandscape = await sharp(outLandscape).metadata();
  assert.equal(metaLandscape.format, "webp");
  assert.equal(metaLandscape.width, 640);
  assert.equal(metaLandscape.height, 480);
});

test("MP4 rusak tidak lolos pemeriksaan resolusi", () => {
  assert.equal(readMp4Resolution(Buffer.from("bukan mp4")), null);
  const fake = Buffer.from("0000ftypisom", "utf8");
  assert.equal(readMp4Resolution(fake), null);
});

test("prepareArticleImage memotong thumbnail 4:3, menjaga rasio inline, EXIF, dan transparansi", async () => {
  // Thumbnail dari gambar lebar -> 480x360
  const wide = await sharp({ create: { width: 1200, height: 600, channels: 3, background: "#10243F" } }).jpeg().toBuffer();
  const thumb = await prepareArticleImage(wide, "thumbnail");
  assert.equal(thumb.contentType, "image/webp");
  assert.equal(thumb.width, 480);
  assert.equal(thumb.height, 360);

  // Thumbnail kecil tanpa upscale -> tetap 4:3 di bawah 480x360
  const tiny = await sharp({ create: { width: 200, height: 200, channels: 3, background: "#10243F" } }).png().toBuffer();
  const tinyThumb = await prepareArticleImage(tiny, "thumbnail");
  assert.equal(tinyThumb.width, 200);
  assert.equal(tinyThumb.height, 150);

  // Inline portrait besar -> maksimal 1600x2400 dengan rasio asli
  const tall = await sharp({ create: { width: 2000, height: 3000, channels: 3, background: "#26599A" } }).png().toBuffer();
  const inlineTall = await prepareArticleImage(tall, "inline");
  assert.equal(inlineTall.width, 1600);
  assert.equal(inlineTall.height, 2400);

  // Transparansi PNG dipertahankan di WebP
  const alphaPng = await sharp({
    create: { width: 320, height: 240, channels: 4, background: { r: 16, g: 36, b: 63, alpha: 0.5 } },
  })
    .png()
    .toBuffer();
  const inlineAlpha = await prepareArticleImage(alphaPng, "inline");
  const alphaMeta = await sharp(inlineAlpha.bytes).metadata();
  assert.equal(alphaMeta.hasAlpha, true);

  // EXIF orientation 6 (600x400 dengan orientasi 90 derajat -> 400x600 setelah rotate)
  const exifRotated = await sharp({ create: { width: 600, height: 400, channels: 3, background: "#10243F" } })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();
  const inlineExif = await prepareArticleImage(exifRotated, "inline");
  assert.equal(inlineExif.width, 400);
  assert.equal(inlineExif.height, 600);
});

test("prepareArticleImage menolak berkas rusak, ukuran berlebih, dan resolusi >40 MP", async () => {
  await assert.rejects(() => prepareArticleImage(Buffer.from("bukan gambar"), "inline"), /rusak|format/i);
  await assert.rejects(() => prepareArticleImage(Buffer.alloc(MAX_IMAGE_SOURCE + 1), "thumbnail"), /10 MB/i);
  // Gambar 7000x7000 = 49 MP (melebihi 40 MP)
  const huge = await sharp({ create: { width: 7000, height: 7000, channels: 3, background: "#ffffff" } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await assert.rejects(() => prepareArticleImage(huge, "inline"), /40 MP|40 megapiksel/i);
});
