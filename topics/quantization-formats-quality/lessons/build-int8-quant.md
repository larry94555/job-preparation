# Build it: int8 quantization

## Scale and zero-point

To store floating-point weights in 8 bits you map their value range onto the 256 integer levels of a
`uint8` (`0..255`). Two numbers define the mapping:

- **scale** = `(max − min) / 255` — the size of one quantization step (the gap between adjacent codes).
- **zero-point** = the integer code that represents `0.0`, computed as `round(−min / scale)` and clamped
  to `[0, 255]`.

Then:

- **quantize:** `q = clamp(round(v / scale) + zeroPoint, 0, 255)`
- **dequantize:** `v ≈ (q − zeroPoint) × scale`

Because you're snapping each value to the nearest of 256 levels, the reconstruction error is at most
about **half a step** — on the order of `scale`. That's the quality you trade for 4× smaller weights.

## The pitfalls

- **Always clamp to [0, 255].** A value that rounds to a code outside the range must be clamped; an
  unclamped code overflows/wraps and **corrupts** the tensor — a silent, catastrophic bug.
- **Guard the constant tensor.** If `max === min`, the range is 0 and `scale` would be 0 → divide by
  zero. Handle it (e.g. `scale = 1`) so a constant tensor reconstructs exactly instead of producing `NaN`.
- **Per-tensor vs per-channel.** One scale for the whole tensor (what this exercise does) is simplest
  but coarse; a scale **per channel/row** fits outliers far better and is why methods like AWQ/GPTQ
  beat naive per-tensor quantization on quality.
