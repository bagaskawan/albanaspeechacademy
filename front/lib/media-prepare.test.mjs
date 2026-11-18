import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { prepareImage, readMp4Resolution } from "./media-prepare.ts";

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
