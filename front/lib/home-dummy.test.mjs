import test from "node:test";
import assert from "node:assert/strict";
import { HOME_DUMMY } from "./home-dummy.ts";

const bentos = [...HOME_DUMMY.programs.map((p) => p.media), HOME_DUMMY.inhouse.media];
const photos = (list) => list.filter((m) => m.kind === "image");
const srcs = (list) => photos(list).map((m) => m.src);

test("tidak ada foto berulang dalam satu bento", () => {
  for (const media of bentos) {
    const s = srcs(media);
    assert.equal(new Set(s).size, s.length);
  }
});

test("hero, bento, dan moments tidak memakai foto yang sama", () => {
  const moments = srcs(HOME_DUMMY.moments);
  assert.ok(moments.length >= 6);
  assert.ok(!moments.includes(HOME_DUMMY.hero.photo.src));
  const bentoSrcs = new Set(bentos.flatMap(srcs));
  for (const src of moments) assert.ok(!bentoSrcs.has(src), src);
  const all = new Set([...bentoSrcs, ...moments]);
  assert.ok(all.size >= 18);
});

test("semua foto contoh berlabel", () => {
  const all = [HOME_DUMMY.hero.photo, ...bentos.flat(), ...HOME_DUMMY.moments];
  for (const m of photos(all)) assert.ok(m.alt.endsWith("— contoh visual, bukan dokumentasi kelas Albana"), m.alt);
});
