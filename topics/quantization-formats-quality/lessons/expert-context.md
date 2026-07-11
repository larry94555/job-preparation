# Expert context: papers, frontier & interview

## Papers people and the frontier

Quantization is a fast-moving systems-and-numerics topic, and its canon is a short list of methods you
should be able to name and attribute correctly in an interview:

- **GPTQ** (Frantar et al., 2022) is a **calibration-based, layerwise weight quantization** method: it
  quantizes weights layer by layer while minimizing output reconstruction error using approximate
  second-order (Hessian) information. It made accurate 4-bit weight quantization of large models
  practical as a post-training step.
- **AWQ** (Lin et al., 2023) is **activation-aware weight quantization**: it identifies the salient
  weight channels tied to large activations and scales/protects them so quantization error there is
  reduced. That "protect the channels that matter for activations" idea is AWQ's signature.
- **SmoothQuant** (Xiao et al.) targets **weight+activation** quantization by **migrating** the
  difficulty of activation outliers into the weights via per-channel scaling, making INT8 activation
  quantization feasible where naive activation quant would fail.
- **LLM.int8()** (Dettmers et al., 2022) is an **outlier-aware INT8** scheme: it keeps a small set of
  outlier activation features in higher precision while running the rest in INT8, preserving quality at
  8-bit.

Tools you'd reference: **AutoGPTQ, AutoAWQ, bitsandbytes, llama.cpp/GGUF** (k-quants), and
**TensorRT-LLM**. Current SOTA is **AWQ/GPTQ 4-bit weight quantization**, **FP8** on new hardware, and
**per-channel / group scales**. Open problems experts still argue about: **reliable low-bit quality
prediction**, **activation quantization at INT4**, and **long-context degradation** under aggressive
quantization.

## Interviewing on quantization formats & quality

What a strong interviewer probes here:

- Can you cleanly distinguish **AWQ vs. GPTQ** — GPTQ as calibration-based layerwise reconstruction
  (Hessian-guided), AWQ as protecting the salient channels tied to large activations — and say when each
  fits? That attribution separates people who've *quantized* models from people who've only read the
  README.
- Do you know **why perplexity can hide task-quality loss**? A quantized model can keep perplexity
  nearly flat while multi-step reasoning, code, and long-context quality drop — because perplexity is an
  averaged next-token loss over generic text.
- Can you reason about **weight-only vs. weight+activation** quantization and why activations are the
  harder target (runtime outliers), and name **SmoothQuant / LLM.int8()** as the outlier-handling prior
  art?

**Red flags** that sink candidates: shipping **INT4 for reasoning-heavy tasks unchecked**, **trusting
perplexity alone** as the quality gate, or **quantizing sensitive layers** blindly. Asked to design a
quantization plan, lead with **weight-only 4-bit (AWQ/GPTQ)** as the safe default, reach for
**SmoothQuant/LLM.int8()** only when you must quantize activations, and verify with **real task evals**
(reasoning, code, long-context) against the FP16 baseline — not perplexity. Showing you know the canon
*and* can reason about where quality actually leaks is what reads as senior.
