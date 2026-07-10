export interface Quantized {
  scale: number;
  zeroPoint: number;
  q: number[];
}

/**
 * Per-tensor asymmetric uint8 quantization.
 * TODO:
 *   range     = max(values) - min(values)
 *   scale     = range === 0 ? 1 : range / 255
 *   zeroPoint = range === 0 ? 0 : clamp(round(-min / scale), 0, 255)
 *   q[i]      = clamp(round(values[i] / scale) + zeroPoint, 0, 255)   (integers in [0,255])
 */
export function quantizeInt8(values: number[]): Quantized {
  throw new Error("not implemented");
}

/** v ≈ (q - zeroPoint) * scale for each code. */
export function dequantize(q: number[], scale: number, zeroPoint: number): number[] {
  throw new Error("not implemented");
}
