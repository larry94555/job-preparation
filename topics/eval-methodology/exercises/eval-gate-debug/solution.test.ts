import assert from "node:assert/strict";
import { test } from "node:test";
import { passesGate } from "./solution.js";

test("a below-threshold batch fails the gate", () => {
  // 2 of 5 pass = 0.4 rate, threshold 0.8 -> must FAIL
  const results = [
    { passed: true },
    { passed: true },
    { passed: false },
    { passed: false },
    { passed: false },
  ];
  assert.equal(passesGate(results, 0.8), false); // fails when denominator excludes failures
});

test("an exactly-at-threshold batch passes the gate", () => {
  // 4 of 5 pass = 0.8 rate, threshold 0.8 -> must PASS (>=, not >)
  const results = [
    { passed: true },
    { passed: true },
    { passed: true },
    { passed: true },
    { passed: false },
  ];
  assert.equal(passesGate(results, 0.8), true);
});

test("an all-pass batch passes the gate", () => {
  const results = [{ passed: true }, { passed: true }, { passed: true }];
  assert.equal(passesGate(results, 0.8), true);
});

test("a batch just below threshold fails the gate", () => {
  // 3 of 4 pass = 0.75 rate, threshold 0.8 -> must FAIL
  const results = [
    { passed: true },
    { passed: true },
    { passed: true },
    { passed: false },
  ];
  assert.equal(passesGate(results, 0.8), false);
});
