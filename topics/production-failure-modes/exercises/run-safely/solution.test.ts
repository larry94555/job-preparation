import assert from "node:assert/strict";
import { test } from "node:test";
import { runSafely } from "./solution.js";

test("returns the first output passing all guards", () => {
  let n = 0;
  const r = runSafely(() => ++n, { guards: [(v) => v > 0], maxAttempts: 3, fallback: -1 });
  assert.equal(r.ok, true);
  assert.equal(r.value, 1);
});

test("retries until all guards pass", () => {
  let n = 0;
  const r = runSafely(() => ++n, { guards: [(v) => v >= 3], maxAttempts: 5, fallback: -1 });
  assert.equal(r.value, 3);
});

test("all guards must pass (any failing guard rejects)", () => {
  let n = 0;
  const r = runSafely(() => ++n, { guards: [(v) => v > 0, (v) => v % 2 === 0], maxAttempts: 10, fallback: -1 });
  assert.equal(r.value, 2); // first value that is both positive and even
});

test("bounded: exhausts attempts then returns fallback with ok:false", () => {
  let calls = 0;
  const r = runSafely(() => { calls++; return -1; }, { guards: [(v) => v > 0], maxAttempts: 3, fallback: 0 });
  assert.equal(r.ok, false);
  assert.equal(r.value, 0);
  assert.equal(calls, 3); // never exceeds maxAttempts
});
