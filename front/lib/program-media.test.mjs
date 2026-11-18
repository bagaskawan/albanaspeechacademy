import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PROGRAM_PHOTOS,
  MAX_PROGRAM_VIDEOS,
  MIN_PROGRAM_PHOTOS,
  MIN_PROGRAM_VIDEOS,
  mediaCapacity,
  photoLimitError,
  videoLimitError,
} from "./program-media.ts";

const items = (photos, videos) => [
  ...Array.from({ length: photos }, () => ({ kind: "image" })),
  ...Array.from({ length: videos }, () => ({ kind: "video" })),
];

test("rentangnya 10-20 foto dan 1-2 video", () => {
  assert.equal(MIN_PROGRAM_PHOTOS, 10);
  assert.equal(MAX_PROGRAM_PHOTOS, 20);
  assert.equal(MIN_PROGRAM_VIDEOS, 1);
  assert.equal(MAX_PROGRAM_VIDEOS, 2);
});

test("di bawah saran memberi peringatan, bukan penolakan", () => {
  const empty = mediaCapacity([]);
  assert.deepEqual([empty.photoSlotsLeft, empty.videoSlotsLeft], [20, 2]);
  assert.equal(empty.photosBelowMin, true);
  assert.equal(empty.videosBelowMin, true);

  const nine = mediaCapacity(items(9, 0));
  assert.equal(nine.photosBelowMin, true);

  const enough = mediaCapacity(items(10, 1));
  assert.equal(enough.photosBelowMin, false);
  assert.equal(enough.videosBelowMin, false);
  assert.equal(enough.photoSlotsLeft, 10);
  assert.equal(enough.videoFull, false);

  const full = mediaCapacity(items(20, 2));
  assert.equal(full.photoFull, true);
  assert.equal(full.videoFull, true);
  assert.equal(full.photoSlotsLeft, 0);
});

test("penambahan yang melewati batas atas ditolak dengan pesan", () => {
  assert.equal(photoLimitError(0, 20), null);
  assert.equal(photoLimitError(18, 2), null);
  assert.ok(photoLimitError(18, 3));
  assert.ok(photoLimitError(20, 1));
  assert.equal(videoLimitError(0), null);
  assert.equal(videoLimitError(1), null);
  assert.ok(videoLimitError(2));
});
