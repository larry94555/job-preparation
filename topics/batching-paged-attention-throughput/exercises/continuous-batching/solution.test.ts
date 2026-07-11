import assert from "node:assert/strict";
import { test } from "node:test";
import { continuousBatchMakespan } from "./solution.js";

test("short requests don't wait behind a long one", () => {
  // static would be 12 ([10,1]=10 + [1,1]=1 + [1,1]=1); continuous cycles the short ones through
  assert.equal(continuousBatchMakespan([10, 1, 1, 1, 1, 1], 2), 10);
});

test("all requests fit in one batch → makespan is the longest", () => {
  assert.equal(continuousBatchMakespan([3, 5, 2], 10), 5);
});

test("small example", () => {
  assert.equal(continuousBatchMakespan([1, 1, 10], 2), 11);
});

test("single request", () => {
  assert.equal(continuousBatchMakespan([5], 4), 5);
});
