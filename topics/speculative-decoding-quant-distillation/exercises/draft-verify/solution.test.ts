import assert from "node:assert/strict";
import { test } from "node:test";
import { speculate } from "./solution.js";

test("whole draft accepted → emits the draft plus one bonus token target(n)", () => {
  // target agrees with every draft token, then emits one more.
  const truth = ["a", "b", "c", "d"];
  const target = (i: number) => truth[i];
  const draft = ["a", "b", "c"]; // all correct
  assert.deepEqual(speculate(draft, target), ["a", "b", "c", "d"]); // length n+1 = 4
});

test("mismatch at index i → emits draft[0..i-1] plus the correction target(i)", () => {
  // draft diverges at index 2: draft[2]='x' but target(2)='c'.
  const truth = ["a", "b", "c", "d", "e"];
  const target = (i: number) => truth[i];
  const draft = ["a", "b", "x", "y"];
  assert.deepEqual(speculate(draft, target), ["a", "b", "c"]); // m=2 → length i+1 = 3
});

test("first token already wrong → emits just [target(0)]", () => {
  const truth = ["a", "b", "c"];
  const target = (i: number) => truth[i];
  const draft = ["z", "z", "z"];
  assert.deepEqual(speculate(draft, target), ["a"]); // m=0 → length 1
});

test("empty draft → emits just [target(0)] (one bonus token)", () => {
  const truth = ["hello", "world"];
  const target = (i: number) => truth[i];
  assert.deepEqual(speculate([], target), ["hello"]); // m=0 → length 1
});
