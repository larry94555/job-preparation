import assert from "node:assert/strict";
import { test } from "node:test";
import { selectConfig } from "./solution.js";

const A = { name: "a", latency: 100, cost: 5, quality: 0.9 };
const B = { name: "b", latency: 50, cost: 2, quality: 0.8 };
const C = { name: "c", latency: 200, cost: 1, quality: 0.95 }; // best quality but violates latency
const slo = { maxLatency: 150, maxCost: 10, minQuality: 0.7 };

test("picks the highest-quality config that MEETS all SLOs", () => {
  // C has the best quality but violates maxLatency, so 'a' should win among {a,b}
  assert.equal(selectConfig([A, B, C], slo)?.name, "a");
});

test("a config violating any SLO is rejected", () => {
  assert.equal(selectConfig([C], slo), null); // latency 200 > 150
});

test("returns null when none meet the SLOs", () => {
  assert.equal(selectConfig([A, B, C], { maxLatency: 150, maxCost: 10, minQuality: 0.99 }), null);
});

test("breaks quality ties by lower cost", () => {
  const X = { name: "x", latency: 10, cost: 9, quality: 0.9 };
  const Y = { name: "y", latency: 10, cost: 3, quality: 0.9 };
  assert.equal(selectConfig([X, Y], slo)?.name, "y");
});
