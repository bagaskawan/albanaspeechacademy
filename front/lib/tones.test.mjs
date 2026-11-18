import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const NAMES = ["canvas", "mist", "night"];
const KEYS = ["bg", "ink", "muted", "rule", "accent", "tile", "sun", "on-sun"];

function block(selector) {
  const esc = selector.replaceAll(".", String.raw`\.`);
  const m = css.match(new RegExp(String.raw`(?:^|\n)\s*${esc}\s*\{([^}]*)\}`));
  return m ? m[1] : "";
}

function vars(selector) {
  const out = {};
  for (const m of block(selector).matchAll(/--tone-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}

function lum(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const cases = NAMES.flatMap((n) => [
  [`${n} terang`, vars(`.tone-${n}`)],
  [`${n} gelap`, vars(`.dark .tone-${n}`)],
]);

test("setiap nada punya delapan variabel di terang dan gelap", () => {
  assert.equal(cases.length, 6);
  for (const [label, v] of cases) assert.deepEqual(Object.keys(v).sort(), [...KEYS].sort(), label);
});

test("teks utama dan muted terbaca", () => {
  for (const [label, v] of cases)
    for (const fg of ["ink", "muted"])
      for (const bg of ["bg", "tile"])
        assert.ok(contrast(v[fg], v[bg]) >= 4.5, `${label} ${fg}/${bg} = ${contrast(v[fg], v[bg]).toFixed(2)}`);
});

test("teks di atas sun terbaca", () => {
  for (const [label, v] of cases)
    assert.ok(contrast(v["on-sun"], v.sun) >= 4.5, `${label} on-sun/sun = ${contrast(v["on-sun"], v.sun).toFixed(2)}`);
});

test("aksen terlihat", () => {
  for (const [label, v] of cases)
    assert.ok(contrast(v.accent, v.bg) >= 3, `${label} accent/bg = ${contrast(v.accent, v.bg).toFixed(2)}`);
});

test("tone-sand sudah dihapus", () => {
  assert.equal(css.includes(".tone-sand"), false);
});
