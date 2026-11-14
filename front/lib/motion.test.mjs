import assert from "node:assert/strict";
import test from "node:test";
import { REVEAL_TRIGGER_FRACTION, REVEAL_TRIGGER_MARGIN, countDurationMs, countUpText } from "./motion.ts";

test("countUpText clamps progress and appends the suffix", () => {
  assert.equal(countUpText(70, 0, "%"), "0%");
  assert.equal(countUpText(70, 0.5, "%"), "35%");
  assert.equal(countUpText(70, 1, "%"), "70%");
  assert.equal(countUpText(70, -1, "%"), "0%");
  assert.equal(countUpText(70, 2, "%"), "70%");
  assert.equal(countUpText(10, 0.44, "%"), "4%");
});

test("the reveal line stays at the upper 60% of the viewport", () => {
  assert.equal(REVEAL_TRIGGER_FRACTION, 0.6);
  assert.equal(REVEAL_TRIGGER_MARGIN, "0px 0px -40% 0px");
});

test("countDurationMs makes smaller figures finish first", () => {
  assert.ok(countDurationMs(10) < countDurationMs(20));
  assert.ok(countDurationMs(20) < countDurationMs(70));
  assert.equal(countDurationMs(10), 350);
  assert.equal(countDurationMs(70), 950);
});
