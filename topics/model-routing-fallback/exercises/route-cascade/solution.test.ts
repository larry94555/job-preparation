import assert from "node:assert/strict";
import { test } from "node:test";
import { route } from "./solution.js";

const models = [
  { name: "cheap", quality: 0.6 },
  { name: "mid", quality: 0.8 },
  { name: "strong", quality: 0.95 },
];

test("cheapest already clears the gate → escalated false", () => {
  assert.deepEqual(route(models, 0.5), { name: "cheap", escalated: false });
});

test("must escalate past the cheap ones → escalated true", () => {
  assert.deepEqual(route(models, 0.7), { name: "mid", escalated: true });
});

test("only the strongest clears the gate → escalated true", () => {
  assert.deepEqual(route(models, 0.9), { name: "strong", escalated: true });
});

test("none meet the gate → strongest, escalated true", () => {
  assert.deepEqual(route(models, 1.0), { name: "strong", escalated: true });
});
