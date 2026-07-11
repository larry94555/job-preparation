import assert from "node:assert/strict";
import { test } from "node:test";
import { batchSize } from "./solution.js";

test("latency SLO is the binding constraint — returns the floor of the knee", () => {
  // 100ms SLO / 30ms per item = floor(3.33) = 3, below waiting (20) and maxBatch (16).
  assert.equal(batchSize(20, 16, 100, 30), 3);
});

test("waiting is the binding constraint", () => {
  // Only 2 queued; SLO allows 10, maxBatch 16 — cannot batch more than are waiting.
  assert.equal(batchSize(2, 16, 100, 10), 2);
});

test("maxBatch is the binding constraint", () => {
  // SLO allows 20, 50 waiting, but the hard cap is 8.
  assert.equal(batchSize(50, 8, 200, 10), 8);
});

test("SLO too tight for even one item → 0", () => {
  // 5ms SLO but each item costs 10ms → floor(0.5) = 0, never negative.
  assert.equal(batchSize(20, 16, 5, 10), 0);
});
