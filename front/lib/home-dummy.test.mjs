import test from "node:test";
import assert from "node:assert/strict";
import { HOME_DUMMY } from "./home-dummy.ts";

const bentos = [...HOME_DUMMY.programs.map((p) => p.media), HOME_DUMMY.inhouse.media];
const photos = (list) => list.filter((m) => m.kind === "image");
// foto + poster video; video tanpa poster tidak punya gambar
const srcs = (list) => list.map((m) => (m.kind === "image" ? m.src : m.poster)).filter(Boolean);
const hero = HOME_DUMMY.hero.photo.src;
const moments = srcs(HOME_DUMMY.moments);

test("tidak ada foto berulang dalam satu bento", () => {
  for (const media of bentos) {
    const s = srcs(media);
    assert.equal(new Set(s).size, s.length);
  }
});

test("hero tidak muncul di bento mana pun", () => {
  for (const media of bentos) assert.ok(!srcs(media).includes(hero));
});

test("bento saling lepas pada src (foto dan poster)", () => {
  const all = bentos.flatMap(srcs);
  assert.equal(new Set(all).size, all.length);
});

test("hero, bento, dan moments tidak memakai foto yang sama", () => {
  assert.ok(moments.length >= 6);
  assert.equal(new Set(moments).size, moments.length);
  assert.ok(!moments.includes(hero));
  const bentoSrcs = new Set(bentos.flatMap(srcs));
  for (const src of moments) assert.ok(!bentoSrcs.has(src), src);
  assert.ok(new Set([hero, ...bentoSrcs, ...moments]).size >= 18);
});

test("semua foto contoh berlabel", () => {
  const all = [HOME_DUMMY.hero.photo, ...bentos.flat(), ...HOME_DUMMY.moments];
  for (const m of photos(all)) assert.ok(m.alt.endsWith("— contoh visual, bukan dokumentasi kelas Albana"), m.alt);
});
