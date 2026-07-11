import assert from "node:assert/strict";
import { test } from "node:test";
import { layeredGet } from "./solution.js";

test("exact hit wins and skips the semantic layer even if a closer semantic entry exists", () => {
  const exact = new Map([["q1", "EXACT"]]);
  // A semantic entry identical to the query vector would score 1.0, but the
  // lossless exact map must short-circuit first.
  const semantic = [{ vec: [1, 0], value: "SEMANTIC" }];
  assert.deepEqual(layeredGet("q1", [1, 0], exact, semantic, 0.9), {
    value: "EXACT",
    source: "exact",
  });
});

test("no exact hit but a semantic entry >= threshold returns source semantic", () => {
  const exact = new Map<string, string>();
  const semantic = [
    { vec: [0, 1], value: "B" },
    { vec: [1, 0], value: "A" },
  ];
  // cosine([0.9,0.1],[1,0]) ≈ 0.994 >= 0.9 → best is A
  assert.deepEqual(layeredGet("q2", [0.9, 0.1], exact, semantic, 0.9), {
    value: "A",
    source: "semantic",
  });
});

test("nothing meets the threshold returns null (miss)", () => {
  const exact = new Map<string, string>();
  const semantic = [{ vec: [1, 0], value: "A" }];
  // cosine([0.7,0.7],[1,0]) ≈ 0.707 < 0.99 → miss
  assert.equal(layeredGet("q3", [0.7, 0.7], exact, semantic, 0.99), null);
});

test("no exact hit and an empty semantic layer is a miss", () => {
  const exact = new Map([["other", "X"]]);
  assert.equal(layeredGet("q4", [1, 0], exact, [], 0.5), null);
});
