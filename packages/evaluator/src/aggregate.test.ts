import assert from "node:assert/strict";
import { test } from "node:test";
import { aggregateChecks } from "./aggregate.js";

test("all checks true → pass", () => {
  const r = aggregateChecks({ a: true, technically_correct: true, c: true, d: true });
  assert.equal(r.verdict, "pass");
  assert.equal(r.score, 1);
});

test("half true, gate ok → borderline", () => {
  const r = aggregateChecks({ both_sides: true, real_tradeoff: false, technically_correct: true, specific: false });
  assert.equal(r.verdict, "borderline");
});

test("gate (correct) false with high score → capped down to borderline", () => {
  const r = aggregateChecks({ a: true, b: true, c: true, technically_correct: false });
  assert.equal(r.gatesPassed, false);
  assert.equal(r.verdict, "borderline"); // base pass, capped one level
});

test("gate false with low score → fail", () => {
  const r = aggregateChecks({ a: false, b: false, technically_correct: false, d: false });
  assert.equal(r.verdict, "fail");
});

test("mostly false → fail", () => {
  const r = aggregateChecks({ a: true, b: false, c: false, d: false });
  assert.equal(r.verdict, "fail");
});

test("no gate checks: 3/4 → pass", () => {
  const r = aggregateChecks({ a: true, b: true, c: true, d: false });
  assert.equal(r.verdict, "pass");
});

test("explicit gate (has_fallback) false caps 3/4 pass → borderline", () => {
  const r = aggregateChecks(
    { validates_against_schema: true, repair_is_bounded: true, has_fallback: false, no_antipatterns: true },
    ["has_fallback"],
  );
  assert.equal(r.verdict, "borderline");
});
