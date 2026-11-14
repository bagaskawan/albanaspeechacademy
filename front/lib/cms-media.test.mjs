import assert from "node:assert/strict";
import test from "node:test";
import { detectCmsMedia } from "./cms-media.ts";

test("unggahan menerima tanda tangan gambar yang cocok dengan MIME", () => {
  assert.equal(detectCmsMedia(Uint8Array.from([0xff, 0xd8, 0xff, 0x00]), "image/jpeg")?.extension, "jpg");
  assert.equal(detectCmsMedia(Uint8Array.from([0xff, 0xd8, 0xff, 0x00]), "image/png"), null);
});
