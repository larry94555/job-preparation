# Quantization — numeric formats & footprint

## What quantization is and why footprint matters

**Quantization** stores a model's numbers in fewer bits than the training format. A weight trained in
16-bit precision might be served as an 8-bit or 4-bit integer. The point is **footprint**: fewer bits
per weight means less memory and less memory *bandwidth*, so a model fits on smaller, cheaper hardware
and — because autoregressive decode is dominated by streaming weights out of memory — often runs faster.

The savings track the bit-width directly. FP16 uses 16 bits per weight; INT4 uses 4. That is a **~4x**
reduction in weight memory (before small overheads like the scales and zero-points described below).
INT8 is a ~2x reduction. This is why a model that needs an expensive multi-GPU box in FP16 can fit on a
single card in INT4.

## Numeric formats: FP16, BF16, FP8, INT8, INT4

The formats differ in how they spend their bits:

- **FP16** — 16-bit float: 1 sign, 5 exponent, 10 mantissa bits. Good precision, but a narrow dynamic
  range that can overflow/underflow.
- **BF16** (bfloat16) — 16-bit float that keeps FP32's **8-bit exponent** (wide range) but has fewer
  mantissa bits. It trades precision for range, which is why it resists overflow in training.
- **FP8** — 8-bit float (e.g. E4M3 / E5M2 variants), a middle ground used for both weights and activations
  on newer hardware.
- **INT8** — 8-bit integer, the classic ~2x quantization target.
- **INT4** — 4-bit integer, the aggressive ~4x target common for weight-only LLM serving.

## Scale, zero-point, and granularity

An integer format can't store fractional values directly, so **affine quantization** pairs each integer
with a **scale** (a floating-point multiplier) and, for asymmetric schemes, a **zero-point** (an offset).
Dequantization recovers an approximate real value: `value ≈ scale × (int − zero_point)`.

Where those scales live is the **granularity** knob:

- **Per-tensor** — one scale for a whole weight tensor. Cheap, but a single wide-ranging channel forces a
  coarse scale on everything.
- **Per-channel** — one scale per row/column, so outlier-heavy channels don't blow up the error for the
  well-behaved ones. More metadata, better quality.

Getting the format and granularity right is what lets a 4x-smaller model stay close to the original.
