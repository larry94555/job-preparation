import assert from "node:assert/strict";
import { test } from "node:test";
import { chooseStrategy } from "./solution.js";

test("fresh/changing facts → rag", () => {
  assert.equal(chooseStrategy({ freshness: true }), "rag");
});
test("citations/attribution → rag", () => {
  assert.equal(chooseStrategy({ attribution: true }), "rag");
});
test("behavior/format change → fine-tuning", () => {
  assert.equal(chooseStrategy({ behaviorChange: true }), "fine-tuning");
});
test("lower latency on a fixed behavior → distillation", () => {
  assert.equal(chooseStrategy({ lowLatency: true }), "distillation");
});
test("nothing special → in-context", () => {
  assert.equal(chooseStrategy({}), "in-context");
});
test("antipattern fix: freshness wins over behaviorChange (not fine-tuning)", () => {
  assert.equal(chooseStrategy({ freshness: true, behaviorChange: true }), "rag");
});
