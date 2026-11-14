import assert from "node:assert/strict";
import test from "node:test";
import { registrationFailure } from "./registration-feedback.ts";

test("respons pendaftaran memberi pemulihan yang sesuai", () => {
  assert.equal(registrationFailure(409).showProgramLink, true);
  assert.match(registrationFailure(422).message, /isian/i);
  assert.match(registrationFailure(429).message, /satu menit/i);
  assert.match(registrationFailure(413).message, /terlalu panjang/i);
  assert.match(registrationFailure(400).message, /format/i);
  assert.match(registrationFailure(415).message, /format/i);
  assert.match(registrationFailure(503).message, /coba lagi/i);
  assert.equal(registrationFailure(503, "Layanan sibuk").message, "Layanan sibuk");
});
