import assert from "node:assert/strict";
import { test } from "node:test";
import { planChunks } from "./solution.js";

test("exact multiple splits into equal full chunks", () => {
  assert.deepEqual(planChunks(3000, 1000), [1000, 1000, 1000]);
});

test("remainder tail: only the last chunk is smaller", () => {
  assert.deepEqual(planChunks(2500, 1000), [1000, 1000, 500]);
});

test("a single prompt smaller than or equal to chunkSize is one full chunk", () => {
  assert.deepEqual(planChunks(1000, 1000), [1000]);
  assert.deepEqual(planChunks(400, 1000), [400]);
});

test("zero-length prompt yields no chunks", () => {
  assert.deepEqual(planChunks(0, 1000), []);
});

test("invariants hold: chunks sum to promptTokens, each <= chunkSize, only last smaller", () => {
  for (const [promptTokens, chunkSize] of [
    [2500, 1000],
    [7, 3],
    [12, 4],
    [1, 1000],
  ] as const) {
    const chunks = planChunks(promptTokens, chunkSize);
    assert.equal(
      chunks.reduce((a, b) => a + b, 0),
      promptTokens,
      "chunks must sum to promptTokens",
    );
    for (const c of chunks) assert.ok(c <= chunkSize, "every chunk <= chunkSize");
    for (let i = 0; i < chunks.length - 1; i++) {
      assert.equal(chunks[i], chunkSize, "only the last chunk may be smaller");
    }
  }
});
