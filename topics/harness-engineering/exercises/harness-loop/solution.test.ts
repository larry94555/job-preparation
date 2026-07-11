import assert from "node:assert/strict";
import { test } from "node:test";
import { runHarnessLoop } from "./solution.js";

test("stops with 'complete' when a step reports done", () => {
  const r = runHarnessLoop((i) => ({ action: "a" + i, done: i >= 2 }), { maxSteps: 10 });
  assert.equal(r.stoppedBy, "complete");
  assert.equal(r.steps, 3);
});

test("stops with 'duplicate-call' when the same action repeats", () => {
  const r = runHarnessLoop(() => ({ action: "same", done: false }), { maxSteps: 10 });
  assert.equal(r.stoppedBy, "duplicate-call");
  assert.equal(r.steps, 2);
});

test("stops with 'budget' when maxSteps is reached", () => {
  const r = runHarnessLoop((i) => ({ action: "a" + i, done: false }), { maxSteps: 3 });
  assert.equal(r.stoppedBy, "budget");
  assert.equal(r.steps, 3);
});
