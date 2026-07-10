import assert from "node:assert/strict";
import { test } from "node:test";
import { estimateLatency } from "./solution.js";

const approx = (a: number, b: number) => Math.abs(a - b) < 1e-9;

test("splits prefill (TTFT) from decode", () => {
  const r = estimateLatency(100, 10, 1000, 0.05);
  assert.ok(approx(r.ttft, 0.1), `ttft ${r.ttft}`);
  assert.ok(approx(r.decode, 0.5), `decode ${r.decode}`);
  assert.ok(approx(r.total, 0.6), `total ${r.total}`);
});

test("a longer prompt raises TTFT but not decode", () => {
  const r = estimateLatency(200, 10, 1000, 0.05);
  assert.ok(approx(r.ttft, 0.2));
  assert.ok(approx(r.decode, 0.5));
});

test("a longer output raises decode but not TTFT", () => {
  const r = estimateLatency(100, 20, 1000, 0.05);
  assert.ok(approx(r.ttft, 0.1));
  assert.ok(approx(r.decode, 1.0));
});
