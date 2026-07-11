# Quantization — methods (GPTQ, AWQ, SmoothQuant) & quality

## GPTQ, AWQ, and SmoothQuant

These are **post-training quantization (PTQ)** methods: they quantize an already-trained model using a
small **calibration** set, no full retraining.

- **GPTQ** quantizes weights **layer by layer**, greedily rounding while **minimizing the output
  reconstruction error** using approximate **second-order (Hessian)** information. It corrects for the
  error each rounding introduces, so it holds up well even at INT4.
- **AWQ** (*activation-aware weight quantization*) starts from the observation that not all weights matter
  equally: the **salient** channels are the ones multiplying large activations. AWQ scales and **protects**
  those channels so their quantization error stays small, leaving the rest to be quantized aggressively.
- **SmoothQuant** targets the **activation-outlier** problem for **weight+activation** quantization. It
  applies an equivalent **per-channel scaling** that migrates the difficulty out of the activations and
  into the weights (which are easier to quantize), *smoothing* both so INT8 activation quantization becomes
  feasible.

Rough rule of thumb: GPTQ and AWQ are go-to **weight-only** methods; SmoothQuant is what makes
**activation** quantization survivable.

## When quantization hurts quality

Cheaper isn't free. The danger is that the damage is **invisible to the wrong metric**.

**Perplexity** — the averaged next-token loss over generic text — is the tempting proxy, and it often
barely moves after quantization. But perplexity is a smooth *average*; it can stay low while the model
quietly loses harder capabilities. Low-bit quantization tends to hurt **multi-step reasoning** (e.g.
GSM8K), **code generation**, and **long-context / long-reasoning** tasks first — exactly the things a
perplexity number smooths over.

So verification means **real task evals**, not perplexity alone: run MMLU/GSM8K, code suites, and your own
domain tasks, and specifically probe long-context and reasoning cases, comparing against the FP16
**baseline**. If quality regresses, the mitigations are the levers from the earlier lessons: prefer
weight-only over weight+activation, raise the bit-width or use per-channel scales, protect sensitive
layers, or switch to a stronger method (AWQ/GPTQ/SmoothQuant).
