import assert from "node:assert/strict";
import { test } from "node:test";
import { runBounded } from "./solution.js";

test("a never-terminating step stops at EXACTLY maxSteps", () => {
  let calls = 0;
  const steps = runBounded(() => {
    calls++;
    return false; // agent never signals done
  }, 5);
  assert.equal(steps, 5); // <- fails when the guard runs one step too many (returns 6)
  assert.equal(calls, 5); // step() was invoked at most maxSteps times
});

test("the returned count never exceeds maxSteps", () => {
  for (const cap of [1, 3, 10, 100]) {
    const steps = runBounded(() => false, cap);
    assert.ok(steps <= cap, `ran ${steps} steps with a budget of ${cap}`);
    assert.equal(steps, cap);
  }
});

test("a step that returns true early stops early", () => {
  let calls = 0;
  const steps = runBounded(() => {
    calls++;
    return calls === 3; // done on the third step
  }, 10);
  assert.equal(steps, 3);
  assert.equal(calls, 3);
});

test("maxSteps of 0 takes no steps", () => {
  let calls = 0;
  const steps = runBounded(() => {
    calls++;
    return false;
  }, 0);
  assert.equal(steps, 0);
  assert.equal(calls, 0);
});
