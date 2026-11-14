import assert from "node:assert/strict";
import test from "node:test";
import { youtubeVideoId } from "./youtube.ts";

test("hanya tautan video YouTube HTTPS yang diterima", () => {
  assert.equal(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("https://youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("http://youtube.com/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(youtubeVideoId("https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ"), null);
});
