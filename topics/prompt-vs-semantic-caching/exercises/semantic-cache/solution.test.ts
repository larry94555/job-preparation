import assert from "node:assert/strict";
import { test } from "node:test";
import { SemanticCache } from "./solution.js";

test("exact match is a hit above threshold", () => {
  const c = new SemanticCache(0.9, 1000);
  c.set([1, 0], "A", 0);
  assert.equal(c.get([1, 0], 100), "A");
});

test("dissimilar query is a miss", () => {
  const c = new SemanticCache(0.9, 1000);
  c.set([1, 0], "A", 0);
  assert.equal(c.get([0, 1], 100), null);
});

test("near but below threshold is a miss (false-positive guard)", () => {
  const c = new SemanticCache(0.99, 1000);
  c.set([1, 0], "A", 0);
  // cosine([1,0],[0.7,0.7]) ≈ 0.707 < 0.99 → miss
  assert.equal(c.get([0.7, 0.7], 100), null);
});

test("an expired entry is a miss", () => {
  const c = new SemanticCache(0.9, 1000);
  c.set([1, 0], "A", 0);
  assert.equal(c.get([1, 0], 5000), null); // 5000 - 0 > 1000
});

test("returns the nearest matching entry", () => {
  const c = new SemanticCache(0.8, 10000);
  c.set([1, 0], "A", 0);
  c.set([0, 1], "B", 0);
  assert.equal(c.get([0.9, 0.1], 1), "A");
});
