import assert from "node:assert/strict";
import { test } from "node:test";
import { SemanticCache } from "./solution.js";

test("a near-identical vector is a HIT above threshold", () => {
  const c = new SemanticCache(0.9);
  c.put([1, 0], "A");
  // cosine([1,0],[0.99,0.01]) ≈ 0.9999 >= 0.9 → hit
  assert.equal(c.get([0.99, 0.01]), "A");
});

test("an orthogonal / dissimilar vector is a MISS", () => {
  const c = new SemanticCache(0.9);
  c.put([1, 0], "A");
  // cosine([1,0],[0,1]) = 0 < 0.9 → miss (must NOT serve the unrelated entry)
  assert.equal(c.get([0, 1]), null);
});

test("threshold boundary: equal similarity is a hit, just-below is a miss", () => {
  // cosine([1,0],[0.6,0.8]) = 0.6 exactly
  const atBoundary = new SemanticCache(0.6);
  atBoundary.put([1, 0], "A");
  assert.equal(atBoundary.get([0.6, 0.8]), "A"); // 0.6 >= 0.6 → hit

  const aboveBoundary = new SemanticCache(0.61);
  aboveBoundary.put([1, 0], "A");
  assert.equal(aboveBoundary.get([0.6, 0.8]), null); // 0.6 < 0.61 → miss
});

test("returns the best-scoring candidate among several entries", () => {
  const c = new SemanticCache(0.8);
  c.put([1, 0], "A");
  c.put([0, 1], "B");
  // cosine([0.9,0.1],[1,0]) ≈ 0.994 beats cosine to [0,1] ≈ 0.110
  assert.equal(c.get([0.9, 0.1]), "A");
});
