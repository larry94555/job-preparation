import assert from "node:assert/strict";
import { test } from "node:test";
import { cohenKappa } from "./solution.js";

test("perfect agreement (with both classes present) → 1", () => {
  const a = [true, false, true, false];
  const b = [true, false, true, false];
  assert.ok(Math.abs(cohenKappa(a, b) - 1) < 1e-9);
});

test("partial agreement → chance-corrected value", () => {
  // a=[T,T,F,F], b=[T,F,F,F]
  // po = 3/4 = 0.75
  // pTrue  = (2/4)*(1/4) = 0.125 ; pFalse = (2/4)*(3/4) = 0.375 ; pe = 0.5
  // kappa = (0.75 - 0.5) / (1 - 0.5) = 0.5
  const a = [true, true, false, false];
  const b = [true, false, false, false];
  assert.ok(Math.abs(cohenKappa(a, b) - 0.5) < 1e-9);
});

test("all raters agree on a single class (pe === 1) → 1, not NaN", () => {
  const a = [true, true, true];
  const b = [true, true, true];
  assert.ok(Math.abs(cohenKappa(a, b) - 1) < 1e-9);
});

test("agreement no better than chance → 0", () => {
  // a=[T,T,F,F], b=[T,F,T,F]
  // po = 2/4 = 0.5
  // pTrue = (2/4)*(2/4)=0.25 ; pFalse = (2/4)*(2/4)=0.25 ; pe = 0.5
  // kappa = (0.5 - 0.5)/(1 - 0.5) = 0
  const a = [true, true, false, false];
  const b = [true, false, true, false];
  assert.ok(Math.abs(cohenKappa(a, b) - 0) < 1e-9);
});
