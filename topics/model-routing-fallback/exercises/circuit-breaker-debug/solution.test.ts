import assert from "node:assert/strict";
import { test } from "node:test";
import { CircuitBreaker } from "./solution.js";

test("stays closed while below the threshold", () => {
  const cb = new CircuitBreaker(3);
  cb.record(false);
  cb.record(false);
  assert.equal(cb.isOpen(), false); // 2 < 3
});

test("opens after threshold consecutive failures", () => {
  const cb = new CircuitBreaker(3);
  cb.record(false);
  cb.record(false);
  cb.record(false);
  assert.equal(cb.isOpen(), true); // <- fails when the counter never accumulates
});

test("a success resets the consecutive-failure count", () => {
  const cb = new CircuitBreaker(3);
  cb.record(false);
  cb.record(false);
  cb.record(true); // clears the streak
  cb.record(false);
  assert.equal(cb.isOpen(), false); // only 1 failure since the reset
});

test("re-accumulates and opens after a reset", () => {
  const cb = new CircuitBreaker(2);
  cb.record(false);
  cb.record(true); // reset
  cb.record(false);
  cb.record(false);
  assert.equal(cb.isOpen(), true); // 2 consecutive failures after the reset
});
