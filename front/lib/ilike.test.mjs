import assert from "node:assert/strict";
import test from "node:test";
import { ilikePattern } from "./ilike.ts";

test("ilikePattern wraps the query and neutralises PostgREST wildcards and separators", () => {
  assert.equal(ilikePattern("  Speaker "), "%Speaker%");
  assert.equal(ilikePattern("50%_off"), "%50\\%\\_off%");
  assert.equal(ilikePattern("a,b(c)"), "%a b c %");
});
