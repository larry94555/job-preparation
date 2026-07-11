/**
 * Per-CHANNEL (per-column) signed int8 quantization.
 *
 * `matrix` is a rows×cols array. Quantize PER COLUMN so each channel gets its
 * own scale — the granularity that rescues outlier channels: a column with one
 * large outlier gets a coarse scale, while a small-magnitude column keeps full
 * int8 resolution (its own max maps to ~±127).
 *
 * For each column c (0..cols-1):
 *   scale[c] = max(|value|) over column c / 127
 *              (if the whole column is zeros, use scale 1 to avoid divide-by-zero)
 *   code     = clamp(round(value / scale[c]), -127, 127)
 *
 * Return `codes` (same shape as matrix) and `scales` (length = number of columns).
 */
export function quantizePerChannel(matrix: number[][]): { codes: number[][]; scales: number[] } {
  throw new Error("not implemented");
}
