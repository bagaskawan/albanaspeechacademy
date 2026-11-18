import test from "node:test";
import assert from "node:assert/strict";
import { parseStorageUrl, getRemovedStorageUrls, deleteStorageFiles } from "./storage-cleanup.ts";

test("parseStorageUrl extracts bucket and path for standard public and signed URLs", () => {
  assert.deepEqual(
    parseStorageUrl("https://proj.supabase.co/storage/v1/object/public/gallery/landing/abc%20123.webp?t=99"),
    { bucket: "gallery", path: "landing/abc 123.webp" }
  );
  assert.deepEqual(
    parseStorageUrl("https://proj.supabase.co/storage/v1/object/sign/legality/legality/doc.webp?token=xyz"),
    { bucket: "legality", path: "legality/doc.webp" }
  );
  assert.deepEqual(
    parseStorageUrl("https://cdn.example.com/testimonials/photo-1.webp"),
    { bucket: "testimonials", path: "photo-1.webp" }
  );
  assert.equal(parseStorageUrl("https://youtu.be/dQw4w9WgXcQ"), null);
  assert.equal(parseStorageUrl(""), null);
  assert.equal(parseStorageUrl(null), null);
});

test("getRemovedStorageUrls detects replaced and removed URLs for single and multiple slots", () => {
  const oldUrls = [
    "https://proj.supabase.co/storage/v1/object/public/venues/a.webp?t=1",
    "https://proj.supabase.co/storage/v1/object/public/venues/b.webp",
    "https://proj.supabase.co/storage/v1/object/public/venues/c.webp",
  ];
  const newUrls = [
    "https://proj.supabase.co/storage/v1/object/public/venues/a.webp?t=2",
    "https://proj.supabase.co/storage/v1/object/public/venues/d.webp",
  ];
  assert.deepEqual(getRemovedStorageUrls(oldUrls, newUrls), [
    "https://proj.supabase.co/storage/v1/object/public/venues/b.webp",
    "https://proj.supabase.co/storage/v1/object/public/venues/c.webp",
  ]);
});

test("deleteStorageFiles groups removals by bucket", async () => {
  const calls = [];
  const fakeSupabase = {
    storage: {
      from(bucket) {
        return {
          async remove(paths) {
            calls.push({ bucket, paths });
            return { data: paths, error: null };
          },
        };
      },
    },
  };

  const result = await deleteStorageFiles(fakeSupabase, [
    "https://proj.supabase.co/storage/v1/object/public/gallery/a.webp",
    "https://proj.supabase.co/storage/v1/object/public/legality/b.webp",
    "https://proj.supabase.co/storage/v1/object/public/gallery/c.webp?t=123",
    "https://example.com/external.png",
  ]);

  assert.equal(result.errors.length, 0);
  assert.deepEqual(result.deleted.sort(), ["a.webp", "b.webp", "c.webp"]);
  assert.equal(calls.length, 2);
});
