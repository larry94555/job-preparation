import assert from "node:assert/strict";
import { test } from "node:test";
import { selectAdapters } from "./solution.js";

const gates = { minQuality: 0.1, maxCost: 0.05, maxLatency: 200 };

test("returns passing levers sorted by qualityGain descending", () => {
  const candidates = [
    { lever: "rag", qualityGain: 0.12, costPerReq: 0.03, latencyMs: 150 },
    { lever: "peft", qualityGain: 0.25, costPerReq: 0.01, latencyMs: 80 },
  ];
  assert.deepEqual(selectAdapters(candidates, gates), ["peft", "rag"]);
});

test("excludes candidates that fail any single gate", () => {
  const candidates = [
    { lever: "low-quality", qualityGain: 0.05, costPerReq: 0.01, latencyMs: 50 }, // fails minQuality
    { lever: "too-costly", qualityGain: 0.3, costPerReq: 0.09, latencyMs: 50 }, // fails maxCost
    { lever: "too-slow", qualityGain: 0.3, costPerReq: 0.01, latencyMs: 500 }, // fails maxLatency
    { lever: "peft", qualityGain: 0.2, costPerReq: 0.02, latencyMs: 100 }, // passes all
  ];
  assert.deepEqual(selectAdapters(candidates, gates), ["peft"]);
});

test("returns an empty array when no candidate passes", () => {
  const candidates = [
    { lever: "weak", qualityGain: 0.02, costPerReq: 0.01, latencyMs: 50 },
    { lever: "expensive", qualityGain: 0.4, costPerReq: 0.5, latencyMs: 50 },
  ];
  assert.deepEqual(selectAdapters(candidates, gates), []);
});

test("boundary values pass on >= / <= gates", () => {
  const candidates = [
    { lever: "edge", qualityGain: 0.1, costPerReq: 0.05, latencyMs: 200 }, // exactly on every bound
  ];
  assert.deepEqual(selectAdapters(candidates, gates), ["edge"]);
});
