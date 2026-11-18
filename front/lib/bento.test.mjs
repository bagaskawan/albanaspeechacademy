import assert from "node:assert/strict";
import test from "node:test";
import { bentoLayout } from "./bento.ts";

function makeMedia(count, withVideo) {
  const items = Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    kind: "image",
  }));
  if (withVideo && count > 0) {
    items[count - 1].kind = "video";
  }
  return items;
}

for (const withVideo of [false, true]) {
  for (let n = 0; n <= 15; n++) {
    test(`bentoLayout 1-petak n=${n} withVideo=${withVideo}`, () => {
      const media = makeMedia(n, withVideo);
      const { tiles, ordered, rest } = bentoLayout(media);

      assert.equal(ordered.length, n);
      assert.equal(tiles.length, n);
      assert.equal(rest, 0);

      if (withVideo && n > 0) {
        if (n >= 2) {
          assert.equal(tiles[1].media.kind, "video");
        } else {
          assert.equal(tiles[0].media.kind, "video");
        }
      }
    });
  }
}
