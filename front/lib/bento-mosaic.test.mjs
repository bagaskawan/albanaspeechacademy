import test from "node:test";
import assert from "node:assert/strict";
import { mosaicLayout } from "./bento.ts";

const media = (n, videoAt = -1) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, kind: i === videoAt ? "video" : "image" }));

const cells = (tiles) =>
  tiles.reduce((sum, { className }) => {
    const col = Number(className.match(/col-span-(\d)/)[1]);
    const row = Number(className.match(/row-span-(\d)/)[1]);
    return sum + col * row;
  }, 0);

test("mosaik memakai 10, 8, atau 4 petak dan menutup persegi 4 kolom", () => {
  for (const [n, shown, area] of [[12, 10, 20], [10, 10, 20], [9, 8, 16], [8, 8, 16], [7, 4, 8], [4, 4, 8]]) {
    const { tiles, rest } = mosaicLayout(media(n));
    assert.equal(tiles.length, shown, `n=${n}`);
    assert.equal(cells(tiles), area, `n=${n}`);
    assert.equal(rest, n - shown, `n=${n}`);
  }
});

test("kurang dari 4 media kembali ke grid seragam", () => {
  const { tiles } = mosaicLayout(media(3));
  assert.equal(tiles.length, 3);
  assert.ok(tiles.every((tile) => tile.className === "aspect-[4/3]"));
});

test("video tetap di petak kedua", () => {
  const { tiles } = mosaicLayout(media(10, 6));
  assert.equal(tiles[1].media.kind, "video");
});
