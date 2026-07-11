import assert from "node:assert/strict";
import { test } from "node:test";
import { aggregate } from "./solution.js";

test("rolls up cost and cost-per-success by feature", () => {
  const r = aggregate([
    { feature: "search", cost: 2, success: true },
    { feature: "search", cost: 4, success: false },
    { feature: "chat", cost: 3, success: true },
    { feature: "chat", cost: 1, success: true },
  ]);
  assert.equal(r.total, 10);
  assert.equal(r.byFeature.search.cost, 6);
  assert.equal(r.byFeature.search.successes, 1);
  assert.equal(r.byFeature.search.costPerSuccess, 6);
  assert.equal(r.byFeature.chat.cost, 4);
  assert.equal(r.byFeature.chat.costPerSuccess, 2); // divides by successes (2), not requests
});

test("zero successes → costPerSuccess is null, not NaN", () => {
  const r = aggregate([{ feature: "x", cost: 5, success: false }]);
  assert.equal(r.byFeature.x.successes, 0);
  assert.equal(r.byFeature.x.costPerSuccess, null);
});
