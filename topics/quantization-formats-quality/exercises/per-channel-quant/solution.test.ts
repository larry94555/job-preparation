import assert from "node:assert/strict";
import { test } from "node:test";
import { quantizePerChannel } from "./solution.js";

test("per-channel beats a single per-tensor scale for a small-value column", () => {
  // Column 0 has a large outlier (1000); column 1 is small-magnitude (max 2).
  // Per-channel gives each column its own scale, so column 1's max (2) maps to
  // ~±127 and keeps full int8 resolution. A single per-tensor scale (1000/127)
  // would crush column 1 to ~0.
  const { codes, scales } = quantizePerChannel([
    [1000, 2],
    [10, 1],
    [0, -2],
  ]);
  assert.equal(scales.length, 2);
  assert.ok(Math.abs(scales[0] - 1000 / 127) < 1e-9, `scale0 ${scales[0]}`);
  assert.ok(Math.abs(scales[1] - 2 / 127) < 1e-9, `scale1 ${scales[1]}`);
  // Column 0 outlier maps to +127; column 1 extremes reach ±127 — full resolution kept.
  assert.equal(codes[0][0], 127);
  assert.equal(codes[0][1], 127);
  assert.equal(codes[2][1], -127);
});

test("all-zeros column uses scale 1 and yields all-zero codes (no divide-by-zero)", () => {
  const { codes, scales } = quantizePerChannel([
    [0, 5],
    [0, -5],
  ]);
  assert.equal(scales[0], 1);
  assert.equal(codes[0][0], 0);
  assert.equal(codes[1][0], 0);
  codes.forEach((row) => row.forEach((x) => assert.ok(Number.isFinite(x), `not finite: ${x}`)));
});

test("codes are clamped to [-127, 127] integers", () => {
  // maxAbs=127 → scale=1; a stray value beyond the column max would round past
  // 127, so clamping must cap it.
  const { codes } = quantizePerChannel([
    [127, -127],
    [200, -200],
  ]);
  codes.forEach((row) =>
    row.forEach((x) => {
      assert.ok(Number.isInteger(x), `not int: ${x}`);
      assert.ok(x >= -127 && x <= 127, `out of range: ${x}`);
    }),
  );
  assert.equal(codes[1][0], 127);
  assert.equal(codes[1][1], -127);
});

test("scales has one entry per column and shape is preserved", () => {
  const matrix = [
    [3, -6, 0],
    [1, 6, 0],
  ];
  const { codes, scales } = quantizePerChannel(matrix);
  assert.equal(scales.length, 3);
  assert.equal(codes.length, matrix.length);
  codes.forEach((row) => assert.equal(row.length, 3));
  // Column 1 max |value| is 6 → its extreme maps to ±127.
  assert.equal(codes[0][1], -127);
  assert.equal(codes[1][1], 127);
});
