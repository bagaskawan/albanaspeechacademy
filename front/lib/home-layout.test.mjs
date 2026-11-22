import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const HOME_FILES = [
  "components/home/ui/number-chip.tsx",
  "components/home/ui/more-link.tsx",
  "components/home/ui/stat-tile.tsx",
  "components/home/ui/tile.tsx",
  "components/home/ui/accent.tsx",
  "components/home/section-intro.tsx",
  "components/home/hero-section.tsx",
  "components/home/benefit-band.tsx",
  "components/home/program-chapter.tsx",
  "components/home/program-story-section.tsx",
  "components/home/bento-gallery.tsx",
  "components/home/inhouse-training-section.tsx",
  "components/home/about-section.tsx",
  "components/home/learning-method-chapter.tsx",
  "components/home/legality-section.tsx",
  "components/home/testimonial-chapter.tsx",
  "components/home/trainer-section.tsx",
  "components/home/trainer-gallery.tsx",
  "components/home/schedule-section.tsx",
  "components/home/registration-steps-section.tsx",
  "components/home/closing-section.tsx",
  "components/home/testimonial-slider.tsx",
  "components/home/photo-break.tsx",
  "components/register/register-page.tsx",
  "components/register/registration-choice.tsx",
  "components/register/registration-form.tsx",
  "components/register/registration-overview.tsx",
  "components/register/registration-steps.tsx",
  "components/ui/field.tsx",
];

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

function readAll() {
  return HOME_FILES.map((rel) => ({
    rel,
    content: fs.readFileSync(path.join(root, rel), "utf8"),
  }));
}

test("tanpa jarak arbitrer", () => {
  const re = /\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-\[/;
  for (const { rel, content } of readAll()) {
    const match = content.match(re);
    assert.equal(match, null, `${rel} memuat jarak arbitrer: ${match?.[0]}`);
  }
});

test("tanpa ukuran huruf arbitrer", () => {
  const re = /\btext-\[(?!var\()/;
  for (const { rel, content } of readAll()) {
    const match = content.match(re);
    assert.equal(match, null, `${rel} memuat ukuran huruf arbitrer: ${match?.[0]}`);
  }
});

test("sudut sesuai aturan", () => {
  const badRounded = /\brounded-(sm|md|lg|xl|2xl|3xl)\b/;
  for (const { rel, content } of readAll()) {
    const match = content.match(badRounded);
    assert.equal(match, null, `${rel} memuat sudut dilarang: ${match?.[0]}`);
    for (const [idx, line] of content.split("\n").entries()) {
      if (line.includes("rounded-full")) {
        assert.ok(line.includes("aspect-square"), `${rel}:${idx + 1} rounded-full tanpa aspect-square`);
      }
    }
  }
});

// Keputusan pemilik 17 Nov 2026: judul memakai serif; aksen lama (accent-serif/accent-frame) diganti `Accent`.
test("aksen judul memakai komponen Accent", () => {
  for (const { rel, content } of readAll()) {
    assert.equal(content.includes("accent-serif"), false, `${rel} memuat accent-serif`);
    assert.equal(content.includes("accent-frame"), false, `${rel} memuat accent-frame`);
  }
});
