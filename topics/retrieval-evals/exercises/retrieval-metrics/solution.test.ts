import assert from "node:assert/strict";
import { test } from "node:test";
import { retrievalMetrics } from "./solution.js";

const approx = (a: number, b: number) => Math.abs(a - b) < 1e-9;

test("worked example: relevant {a,b,c}, retrieved [x,a,y,b,z], k=3", () => {
  const r = retrievalMetrics(["a", "b", "c"], ["x", "a", "y", "b", "z"], 3);
  assert.ok(approx(r.recallAtK, 1 / 3), `recall ${r.recallAtK}`);
  assert.ok(approx(r.precisionAtK, 1 / 3), `precision ${r.precisionAtK}`);
  assert.ok(approx(r.mrr, 1 / 2), `mrr ${r.mrr}`); // first relevant 'a' at rank 2
});

test("recall and precision use different denominators", () => {
  // 1 hit in top-2, relevant has 4 → recall 1/4, precision 1/2 (must differ)
  const r = retrievalMetrics(["a", "b", "c", "d"], ["a", "z", "y"], 2);
  assert.ok(approx(r.recallAtK, 1 / 4), `recall ${r.recallAtK}`);
  assert.ok(approx(r.precisionAtK, 1 / 2), `precision ${r.precisionAtK}`);
  assert.ok(approx(r.mrr, 1), "first relevant at rank 1");
});

test("no relevant items → no division by zero", () => {
  const r = retrievalMetrics([], ["a", "b"], 2);
  assert.ok(approx(r.recallAtK, 0), `recall ${r.recallAtK}`);
  assert.ok(approx(r.mrr, 0), `mrr ${r.mrr}`);
});

test("no relevant item retrieved → mrr 0, recall 0", () => {
  const r = retrievalMetrics(["a"], ["x", "y", "z"], 2);
  assert.ok(approx(r.recallAtK, 0));
  assert.ok(approx(r.mrr, 0));
});
