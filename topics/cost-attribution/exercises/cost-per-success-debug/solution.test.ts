import assert from "node:assert/strict";
import { test } from "node:test";
import { costPerSuccess } from "./solution.js";

test("charges failed/retried attempts to the successes (exposes wrong denominator)", () => {
  // 4 attempts at $1 each = $4 total, but only 2 succeeded.
  // True cost per success = $4 / 2 = $2.
  // The buggy version divides by 4 attempts and reports $1 — too low.
  const calls = [
    { costUsd: 1, success: false },
    { costUsd: 1, success: true },
    { costUsd: 1, success: false },
    { costUsd: 1, success: true },
  ];
  assert.equal(costPerSuccess(calls), 2);
});

test("all-successful workload: denominator equals attempt count, both agree", () => {
  const calls = [
    { costUsd: 2, success: true },
    { costUsd: 4, success: true },
  ];
  // 6 / 2 successes = 3, which also equals 6 / 2 attempts.
  assert.equal(costPerSuccess(calls), 3);
});

test("zero successes returns Infinity sentinel (no divide-by-zero)", () => {
  const calls = [
    { costUsd: 5, success: false },
    { costUsd: 3, success: false },
  ];
  assert.equal(costPerSuccess(calls), Infinity);
});

test("single success absorbs the full spend of surrounding failures", () => {
  const calls = [
    { costUsd: 0.5, success: false },
    { costUsd: 0.5, success: false },
    { costUsd: 0.5, success: false },
    { costUsd: 0.5, success: true },
  ];
  // $2 total / 1 success = $2; buggy version reports $0.50.
  assert.equal(costPerSuccess(calls), 2);
});
