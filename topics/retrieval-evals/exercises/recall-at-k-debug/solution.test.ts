import assert from "node:assert/strict";
import { test } from "node:test";
import { recallAtK } from "./solution.js";

test("recall is hits / total-relevant when k equals #relevant", () => {
  // 2 relevant docs, both in the top-2 retrieved -> recall 1.0
  const retrieved = ["a", "b", "c", "d"];
  const relevant = ["a", "b"];
  assert.equal(recallAtK(retrieved, relevant, 2), 1);
});

test("a large k does not push recall above 1 (exposes the wrong denominator)", () => {
  // 2 relevant docs, both retrieved; k=10 is larger than #relevant.
  // Dividing by k gives 2/10 = 0.2; the correct answer is 2/2 = 1.
  const retrieved = ["a", "b", "c", "d"];
  const relevant = ["a", "b"];
  assert.equal(recallAtK(retrieved, relevant, 10), 1);
});

test("partial recall uses #relevant as the denominator", () => {
  // 4 relevant, only 1 of them in the top-3 retrieved -> 1/4 = 0.25.
  // Dividing by k (=3) would wrongly give 1/3.
  const retrieved = ["a", "x", "y", "b"];
  const relevant = ["a", "b", "c", "d"];
  assert.equal(recallAtK(retrieved, relevant, 3), 0.25);
});

test("empty relevant set returns 0 (no division by zero)", () => {
  const result = recallAtK(["a", "b"], [], 5);
  assert.equal(result, 0);
  assert.ok(Number.isFinite(result));
});
