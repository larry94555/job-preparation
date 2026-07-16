# Quantization — weights vs. activations vs. KV cache

## Weights vs. activations

Not everything in a model is equally easy to quantize.

- **Weights** are **static**. They are fixed after training, so you can look at their distribution once,
  choose good scales, and even do offline optimization. Weights tolerate low bit-width (INT4) fairly well.
- **Activations** are **dynamic** — computed at runtime and different for every input. Worse, they contain
  a few very large **outlier features**: a handful of channels with huge magnitudes that a fixed low-bit
  range simply cannot represent without crushing everything else. This is why activations are **harder to
  quantize** than weights.

The practical consequence: **weight-only** quantization (INT4 weights, activations kept in higher
precision like FP16) is the forgiving default. It captures most of the memory-bandwidth win — decode is
weight-streaming-bound — while sidestepping the activation-outlier problem. Weight+activation quantization
(e.g. INT8 both) saves more but needs extra care to survive the outliers.

## Quantizing the KV cache

There is a third thing you can quantize: the **KV cache**. During generation, every past token's keys and
values are cached so attention doesn't recompute them. That cache grows with **sequence length × batch
size** and, at long context, can consume more memory than the weights.

Storing KV in **INT8 or FP8** instead of FP16 roughly halves that per-token cost, which directly buys you
**longer contexts or larger batches**. The tradeoff is quality: KV entries feed attention across the whole
sequence, so aggressive KV quantization can degrade long-sequence behavior and is applied more cautiously
than weight-only quantization.

This matters because *what* you quantize is your first and biggest quality lever: weight-only is the
forgiving default, and knowing why activations and the KV cache are riskier is what keeps a low-bit
deployment from silently degrading.
