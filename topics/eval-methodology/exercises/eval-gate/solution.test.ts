import assert from "node:assert/strict";
import { test } from "node:test";
import { runEvalGate } from "./solution.js";

const run = (i: string): string => (({ "2": "4", "3": "9", x: "z" }) as Record<string, string>)[i] ?? "";
const cases = [
  { name: "a", input: "2", expected: "4" }, // pass
  { name: "b", input: "3", expected: "9" }, // pass
  { name: "c", input: "x", expected: "y" }, // fail (run returns "z")
];

test("computes pass rate and lists failures; gate fails below threshold", () => {
  const r = runEvalGate(cases, run, 0.9);
  assert.ok(Math.abs(r.passRate - 2 / 3) < 1e-9, `passRate ${r.passRate}`);
  assert.equal(r.passed, false); // 0.667 < 0.9
  assert.deepEqual(r.failures, ["c"]);
});

test("gate passes when pass rate meets the threshold", () => {
  const r = runEvalGate(cases, run, 0.5);
  assert.equal(r.passed, true);
});
