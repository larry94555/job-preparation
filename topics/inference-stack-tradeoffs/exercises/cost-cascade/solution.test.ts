import assert from "node:assert/strict";
import { test } from "node:test";
import { runCascade } from "./solution.js";

test("stops at the first tier that clears the threshold, cumulative cost through it", () => {
  const tiers = [
    { name: "cheap", cost: 1, confidence: 0.9 },
    { name: "mid", cost: 5, confidence: 0.95 },
    { name: "strong", cost: 20, confidence: 0.99 },
  ];
  // cheap already clears 0.8 → pay only for cheap
  assert.deepEqual(runCascade(tiers, 0.8), { name: "cheap", totalCost: 1 });
});

test("escalates through several tiers, accumulating cost until one is confident", () => {
  const tiers = [
    { name: "cheap", cost: 1, confidence: 0.5 },
    { name: "mid", cost: 5, confidence: 0.7 },
    { name: "strong", cost: 20, confidence: 0.97 },
  ];
  // cheap (0.5) and mid (0.7) miss 0.95; strong clears it → 1 + 5 + 20
  assert.deepEqual(runCascade(tiers, 0.95), { name: "strong", totalCost: 26 });
});

test("threshold met exactly counts as confident (>=)", () => {
  const tiers = [
    { name: "cheap", cost: 2, confidence: 0.6 },
    { name: "mid", cost: 4, confidence: 0.9 },
  ];
  assert.deepEqual(runCascade(tiers, 0.9), { name: "mid", totalCost: 6 });
});

test("no tier reaches the threshold falls back to the last tier with the full cost sum", () => {
  const tiers = [
    { name: "cheap", cost: 1, confidence: 0.5 },
    { name: "mid", cost: 5, confidence: 0.7 },
    { name: "strong", cost: 20, confidence: 0.85 },
  ];
  // none clear 0.99 → last tier, paid the whole cascade: 1 + 5 + 20
  assert.deepEqual(runCascade(tiers, 0.99), { name: "strong", totalCost: 26 });
});
