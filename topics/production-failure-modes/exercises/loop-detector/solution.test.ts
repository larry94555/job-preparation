import assert from "node:assert/strict";
import { test } from "node:test";
import { isStuck } from "./solution.js";

test("last k identical → stuck", () => {
  // last 3 are all "search" → the agent is looping.
  assert.equal(isStuck(["plan", "search", "search", "search"], 3), true);
});

test("last k not all identical → not stuck (only the tail matters)", () => {
  // an earlier "search" run doesn't matter; the last 3 differ.
  assert.equal(isStuck(["search", "search", "search", "read", "search"], 3), false);
});

test("fewer than k actions → not stuck", () => {
  assert.equal(isStuck(["search", "search"], 3), false);
});

test("k=1 always trips on a non-empty history (documented)", () => {
  assert.equal(isStuck(["search"], 1), true);
  assert.equal(isStuck([], 1), false);
});
