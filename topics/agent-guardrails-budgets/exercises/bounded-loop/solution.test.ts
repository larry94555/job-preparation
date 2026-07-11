import assert from "node:assert/strict";
import { test } from "node:test";
import { runAgent } from "./solution.js";

test("stops with 'complete' when the task finishes", () => {
  const r = runAgent((s: number) => ({ state: s + 1, done: s + 1 >= 3 }), { initial: 0, maxSteps: 10 });
  assert.equal(r.stoppedBy, "complete");
  assert.equal(r.steps, 3);
  assert.equal(r.state, 3);
});

test("stops with 'budget' when maxSteps is reached", () => {
  const r = runAgent((s: number) => ({ state: s + 1, done: false }), { initial: 0, maxSteps: 3 });
  assert.equal(r.stoppedBy, "budget");
  assert.equal(r.steps, 3);
});

test("stops with 'no-progress' when the state doesn't change", () => {
  const r = runAgent((s: number) => ({ state: s, done: false }), { initial: 0, maxSteps: 10 });
  assert.equal(r.stoppedBy, "no-progress");
  assert.equal(r.steps, 1);
});
