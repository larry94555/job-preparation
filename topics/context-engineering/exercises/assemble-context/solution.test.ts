import assert from "node:assert/strict";
import { test } from "node:test";
import { assembleContext } from "./solution.js";

const S = [
  { id: "A", tokens: 100, priority: 3 },
  { id: "C", tokens: 100, priority: 2 },
  { id: "B", tokens: 50, priority: 1 },
];

test("includes highest-priority sections that fit the budget", () => {
  assert.deepEqual(assembleContext(S, 220), ["A", "C"]); // B (50) would make 250 > 220
});

test("a bigger budget lets more sections in, in priority order", () => {
  assert.deepEqual(assembleContext(S, 260), ["A", "C", "B"]);
});

test("keeps scanning: a smaller lower-priority section fits when a bigger one didn't", () => {
  const s2 = [
    { id: "big", tokens: 200, priority: 3 },
    { id: "med", tokens: 100, priority: 2 },
    { id: "small", tokens: 50, priority: 1 },
  ];
  // big(200) fits; med would be 300 > 260 (skip); small fits at 250
  assert.deepEqual(assembleContext(s2, 260), ["big", "small"]);
});

test("never exceeds the budget", () => {
  assert.deepEqual(assembleContext(S, 40), []); // nothing fits
});
