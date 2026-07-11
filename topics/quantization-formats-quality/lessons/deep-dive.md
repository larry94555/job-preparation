# Quantization — architecture, tradeoffs, and reviewing a design

You already know the numeric formats, what to quantize (weights vs. activations vs. KV cache), the
PTQ methods (GPTQ, AWQ, SmoothQuant), and why perplexity can hide task loss. This lesson zooms out to
the **design space**: the levers a systems engineer actually pulls when shrinking a model, what each
one trades away, and how to judge someone else's quantization plan the way an interviewer or a staff
engineer in a design review would.

## The quantization-formats-quality design space

Every quantization decision is really a decision about **how much footprint and bandwidth you buy
back, and how much task quality you are willing to risk to get it**. There are five largely
independent levers, and real deployments combine them:

- **Bit-width** — FP16 → INT8 (~2x) → INT4 (~4x). Fewer bits means less weight memory and less memory
  *bandwidth*, and since autoregressive decode is weight-streaming-bound, often more speed. But error
  grows as bits shrink, and low-bit hurts the hardest capabilities first.
- **What you quantize** — weights only vs. weights+activations vs. the KV cache. Weights are
  **static** and tolerate INT4 well; activations are **dynamic** with outlier features and are far
  harder; the KV cache is a third target that trades long-context quality for capacity. Weight-only
  is the forgiving default because it captures most of the bandwidth win while sidestepping the
  activation-outlier problem.
- **Method** — round-to-nearest vs. **GPTQ** (Hessian-guided layerwise reconstruction) vs. **AWQ**
  (protect the salient channels tied to large activations) vs. **SmoothQuant** (migrate activation
  outliers into the weights so INT8 activations survive) vs. **LLM.int8()** (keep outlier features in
  higher precision). The method is what lets a 4-bit model stay close to the FP16 baseline.
- **Granularity** — per-tensor vs. per-channel vs. per-group scales (and zero-points). One scale per
  tensor is cheapest but lets a single wide-ranging channel force a coarse scale on everything;
  per-channel/group scales cost metadata but rescue the well-behaved channels from the outliers.
- **Verification** — perplexity smoke test vs. real task evals (MMLU/GSM8K, code, domain suites,
  long-context probes) against the FP16 baseline. This is a lever because *how you measure* decides
  what silent regressions you ship.

## A tradeoff table for quantization-formats-quality

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Weight-only INT4 (GPTQ/AWQ) | ~4x smaller weights, big bandwidth/latency win, forgiving quality | Activations stay FP16 (less total saving); still needs task eval | The default for LLM serving; footprint-bound |
| Weight+activation INT8 (SmoothQuant / LLM.int8()) | More total saving; INT8 matmul throughput | Activation outliers must be handled or quality collapses | You must shrink activations too and can afford the care |
| Per-channel / per-group scales | Rescues outlier-heavy channels, better quality at same bits | More metadata, more complex kernels | Per-tensor error is too high, especially near INT4 |
| FP8 on new hardware | Weights **and** activations in 8 bits with float dynamic range | Requires FP8-capable GPUs; newer, less battle-tested | You have the hardware and want an activation-friendly 8-bit |
| KV-cache INT8/FP8 | ~2x KV, longer contexts / bigger batches | Long-context quality drift; apply cautiously | KV dominates memory at long context and a quality budget exists |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just quantize it to INT4" without naming weights-vs-activations,
the method, and the eval they'd run is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold this subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** INT4 **weight-only** quantization via GPTQ or AWQ, with
  per-channel or per-group scales, activations kept in FP16, verified with a quick eval. This is what
  AutoGPTQ / AutoAWQ / bitsandbytes / llama.cpp GGUF k-quants give you and it is a perfectly good
  baseline for most serving.
- **SOTA (frontier, worth reaching for under real pressure):** AWQ/GPTQ 4-bit weights **plus** FP8 on
  new hardware for weights *and* activations, **plus** SmoothQuant or LLM.int8() when activations must
  be quantized, **plus** per-group scales and protection of sensitive layers, all **gated behind real
  task evals** (reasoning, code, long-context) rather than perplexity. The frontier is treating the
  eval as part of the design, not an afterthought.
- **Antipattern (looks fine, fails in production):** pushing INT4 on **reasoning-heavy** tasks
  unchecked; **trusting perplexity alone** and shipping when it barely moved; quantizing
  **sensitive/activation-outlier layers** with a single per-tensor scale; or quantizing activations
  naively (no SmoothQuant/outlier handling) and watching quality collapse. Each passes a demo and
  degrades under real traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Savings track bit-width directly.** FP16→INT8 is ~2x weight memory; FP16→INT4 is ~4x (before
  small scale/zero-point overhead). Because decode streams weights out of memory, that footprint cut
  usually shows up as **throughput/latency**, not just capacity — a model that needed a multi-GPU box
  in FP16 can fit and run faster on a single card in INT4.
- **Activations do not shrink for free.** Weight-only INT4 leaves activations in FP16, so the *total*
  memory saving is less than the weight ratio suggests. Getting the extra saving means INT8/FP8
  activations, which means paying for outlier handling (SmoothQuant, LLM.int8(), or FP8's float range).
- **KV cache is its own budget.** At long context the KV cache can exceed the weights; INT8/FP8 KV
  roughly halves per-token KV and buys longer contexts or bigger batches — but the error feeds
  attention across the whole sequence, so it degrades long-sequence behavior and is applied more
  cautiously than weight quant.
- **Quality error is not uniform.** Perplexity is a smooth average and can stay flat while GSM8K, code
  suites, and long-context tasks drop. The cost of skipping a real eval is a **silent** regression that
  a short-prompt smoke test never sees — the eval budget is part of the token budget.

## Reviewing a quantization-formats-quality design

When you are handed a quantization plan to critique — in a review or an interview — walk the same
checklist:

1. **What is quantized, to how many bits?** Weight-only vs. weight+activation vs. KV, and INT8 vs.
   INT4. Weight+activation INT4 with no outlier handling is an immediate flag.
2. **Which method and granularity?** Round-to-nearest per-tensor near INT4 is fragile; a real plan
   names GPTQ/AWQ (and SmoothQuant/LLM.int8() if activations) and per-channel/group scales.
3. **Which layers are protected?** Blindly quantizing sensitive or outlier-heavy layers is a red flag.
4. **How is quality verified?** "Perplexity barely moved" is not verification. Demand real task evals
   (reasoning, code, long-context, domain) against the **FP16 baseline**.
5. **What is the mitigation if it regresses?** A real design names its escape hatch — raise bit-width,
   switch to per-group scales, protect sensitive layers, or move from weight+activation to weight-only.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A toy just picks a bit-width; a prototype picks a method; a demo shows perplexity
unchanged; a production-ready design also protects sensitive layers, uses appropriate granularity, and
gates the whole thing behind real task evals against the baseline.
