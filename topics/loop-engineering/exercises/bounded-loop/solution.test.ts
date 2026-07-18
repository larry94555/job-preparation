import assert from "node:assert/strict";
import { test } from "node:test";
import { runBoundedLoop } from "./solution.js";

test("stops with 'done' when a step reports done", () => {
  const r = runBoundedLoop((i) => ({ action: "a" + i, state: "s" + i, done: i >= 2 }), {
    maxSteps: 10,
  });
  assert.equal(r.stoppedBy, "done");
  assert.equal(r.steps, 3);
});

test("stops with 'no-progress' when the observed state does not change", () => {
  const r = runBoundedLoop(() => ({ action: "poke", state: "stuck", done: false }), {
    maxSteps: 10,
  });
  assert.equal(r.stoppedBy, "no-progress");
  assert.equal(r.steps, 2);
});

test("stops with 'budget' when maxSteps is reached and progress keeps being made", () => {
  const r = runBoundedLoop((i) => ({ action: "a" + i, state: "s" + i, done: false }), {
    maxSteps: 3,
  });
  assert.equal(r.stoppedBy, "budget");
  assert.equal(r.steps, 3);
});

test("'done' takes precedence over 'budget' at the cap", () => {
  const r = runBoundedLoop((i) => ({ action: "a" + i, state: "s" + i, done: i >= 2 }), {
    maxSteps: 3,
  });
  assert.equal(r.stoppedBy, "done");
  assert.equal(r.steps, 3);
});
