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

test("MP4 rusak tidak lolos pemeriksaan resolusi", () => {
  assert.equal(readMp4Resolution(Buffer.from("bukan mp4")), null);
  const fake = Buffer.from("0000ftypisom", "utf8");
  assert.equal(readMp4Resolution(fake), null);
});
