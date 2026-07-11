import assert from "node:assert/strict";
import { test } from "node:test";
import { dequantize, quantizeInt8 } from "./solution.js";

test("dequantize(quantize(v)) reconstructs within one quantization step", () => {
  const vals = [-1, -0.3, 0, 0.7, 1];
  const { scale, zeroPoint, q } = quantizeInt8(vals);
  const recon = dequantize(q, scale, zeroPoint);
  recon.forEach((r, i) => assert.ok(Math.abs(r - vals[i]) <= scale + 1e-9, `${r} vs ${vals[i]}`));
});

test("scale spans the range over 255 levels", () => {
  const { scale } = quantizeInt8([0, 255]);
  assert.ok(Math.abs(scale - 1) < 1e-9, `scale ${scale}`);
});

test("all codes are integers in [0,255]", () => {
  const { q } = quantizeInt8([-5, 0, 3, 9]);
  q.forEach((x) => {
    assert.ok(Number.isInteger(x), `not int: ${x}`);
    assert.ok(x >= 0 && x <= 255, `out of range: ${x}`);
  });
});

test("constant tensor doesn't divide by zero", () => {
  const { scale, zeroPoint, q } = quantizeInt8([5, 5, 5]);
  const recon = dequantize(q, scale, zeroPoint);
  recon.forEach((r) => assert.ok(Math.abs(r - 5) < 1e-9, `recon ${r}`));
});
