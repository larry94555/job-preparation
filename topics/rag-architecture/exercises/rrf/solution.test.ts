import assert from "node:assert/strict";
import { test } from "node:test";
import { reciprocalRankFusion } from "./solution.js";

test("worked example: b wins by ranking high in both lists", () => {
  const fused = reciprocalRankFusion([["a", "b", "c"], ["b", "c", "a"]], 60);
  assert.deepEqual(fused, ["b", "a", "c"]);
});

test("a single list is returned in its own order", () => {
  assert.deepEqual(reciprocalRankFusion([["x", "y", "z"]], 60), ["x", "y", "z"]);
});

test("items missing from a list still score; ties break by id ascending", () => {
  // a: 1/61, c: 1/61 (tie → a before c), b: 1/62
  assert.deepEqual(reciprocalRankFusion([["a", "b"], ["c"]], 60), ["a", "c", "b"]);
});

test("empty input → empty output", () => {
  assert.deepEqual(reciprocalRankFusion([], 60), []);
});
