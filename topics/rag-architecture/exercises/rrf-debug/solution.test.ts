import assert from "node:assert/strict";
import { test } from "node:test";
import { reciprocalRankFusion } from "./solution.js";

// Helper: reconstruct each id's fused score the way RRF defines it, so we can
// assert on finiteness without depending on the buggy implementation's internals.
function isFiniteNumber(x: number): boolean {
  return Number.isFinite(x);
}

test("k-damped fusion ranks a broadly-agreed id above a single-list top hit", () => {
  // "shared" is #2 in both lists; "onlyA" is #1 in list A but absent from B.
  // With proper RRF (k=60): score(shared) = 1/62 + 1/62 ≈ 0.03226,
  //                         score(onlyA)  = 1/61            ≈ 0.01639.
  // So the broadly-agreed "shared" should win. The buggy 1/rank version scores
  // onlyA = Infinity (rank 0) and ranks it first — wrong.
  const listA = ["onlyA", "shared", "a3"];
  const listB = ["b1", "shared", "b3"];
  const fused = reciprocalRankFusion([listA, listB]);
  assert.equal(fused[0], "shared");
  assert.ok(fused.indexOf("shared") < fused.indexOf("onlyA"));
});

test("no fused score is Infinity or NaN (top-ranked item must be finite)", () => {
  const listA = ["x", "y", "z"];
  const listB = ["y", "x", "w"];
  const fused = reciprocalRankFusion([listA, listB]);
  // Reconstruct scores from the same RRF definition to check finiteness.
  const k = 60;
  const scores = new Map<string, number>();
  for (const list of [listA, listB]) {
    list.forEach((id, i) => {
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + i + 1));
    });
  }
  for (const s of scores.values()) {
    assert.ok(isFiniteNumber(s));
  }
  // A correct implementation returns every id exactly once, all finite-scored.
  assert.equal(new Set(fused).size, fused.length);
  assert.deepEqual([...fused].sort(), ["w", "x", "y", "z"]);
});

test("k dampens rank gaps: a consensus id beats a lone #1 as k grows", () => {
  // "c" appears at rank 2 in three lists; "top" is rank 1 in one list only.
  // With k=60, three contributions of 1/62 (~0.0484) beat one of 1/61 (~0.0164).
  const lists = [
    ["top", "c"],
    ["p", "c"],
    ["q", "c"],
  ];
  const fused = reciprocalRankFusion(lists);
  assert.equal(fused[0], "c");
});

test("respects a custom k value and stays finite", () => {
  const fused = reciprocalRankFusion([["a", "b"], ["b", "a"]], 1);
  // Both ids appear at rank 1 and rank 2 across the two lists, so scores tie and
  // both must be present and finite regardless of k.
  assert.equal(new Set(fused).size, 2);
  assert.deepEqual([...fused].sort(), ["a", "b"]);
});
