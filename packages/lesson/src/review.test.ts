import assert from "node:assert/strict";
import { test } from "node:test";
import { initialReview, isDue, scheduleReview } from "./review.js";

const NOW = 1_000_000_000_000;

test("a wrong answer makes the item due immediately", () => {
  const s = scheduleReview(undefined, false, NOW);
  assert.equal(s.reps, 0);
  assert.equal(s.intervalDays, 0);
  assert.ok(s.lapses >= 1);
  assert.ok(isDue(s, NOW), "should be due now");
});

test("a right answer pushes the next review into the future", () => {
  const s = scheduleReview(undefined, true, NOW);
  assert.equal(s.reps, 1);
  assert.equal(s.intervalDays, 1);
  assert.ok(!isDue(s, NOW), "not due immediately");
  assert.ok(isDue(s, NOW + 2 * 86_400_000), "due after 2 days");
});

test("consecutive correct answers grow the interval", () => {
  let s = scheduleReview(undefined, true, NOW); // interval 1
  s = scheduleReview(s, true, s.dueAt); // interval 6
  const third = scheduleReview(s, true, s.dueAt);
  assert.ok(third.intervalDays > 6, "third correct interval grows beyond 6");
});

test("ease never drops below 1.3", () => {
  let s = initialReview(NOW);
  for (let i = 0; i < 10; i++) s = scheduleReview(s, false, NOW);
  assert.ok(s.ease >= 1.3);
});
