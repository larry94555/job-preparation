---
title: "Verifying quality: perplexity, task evals and the eval gate"
order: 3
covers:
  - cloze-perplexity
  - mc-perplexity-hides
  - fe-verify-metric
  - mc-review-quant-perplexity-gate
  - mc-ops-quant-perplexity-gap
  - mc-ops-quant-eval-gate
  - mc-frontier-quant-low-bit-prediction
---
## Verifying quality: perplexity, task evals and the eval gate

**In brief.** Cheaper is not free, and the damage low-bit quantization does is **invisible to the wrong
metric**. Knowing what perplexity actually measures, which capabilities break first, and what gates a
build against the FP16 baseline is the difference between shipping a quantized model and shipping a
silent regression.

**What to measure.**

- **Perplexity** — the exponentiated **average next-token loss** over held-out generic text. It is a
  language-modeling measure: not task accuracy, not memory saved, not latency per token. It averages
  over a great many easy tokens, which is precisely its weakness.
- **Why it hides damage** — perplexity is a smooth average that dilutes the reasoning tokens
  quantization damages. A quantized model can hold perplexity nearly flat while losing accuracy on
  MMLU, GSM8K, code, or long context. Perplexity is therefore never the gate on its own.
- **What degrades first** — multi-step reasoning, code generation, and long-context tasks. Quantization
  noise compounds over long chains of dependent steps, so those break well before generic next-token
  prediction on everyday text does — and that is exactly the loss an averaged number smooths over.
- **The perplexity versus task-eval gap** — a tiny perplexity delta alongside a large drop on GSM8K or a
  code suite is **not** a contradiction and not a measurement bug. It is the **expected signature of
  low-bit damage**. Read it that way and gate on the task-eval delta.
- **Per-task quality delta** — measure each task against the **FP16 baseline**, not as one aggregate.
  Low-bit error is not uniform: reasoning, code and long-context drop while short-prompt tasks look
  fine. The per-task delta turns "it seems okay" into a decision you can defend, and locates which
  capability to protect.
- **Real task evals** — MMLU and GSM8K, code suites, your own domain tasks, and explicit long-context
  and reasoning probes, each compared against the FP16 baseline. That is what "verified" means for a
  precision change on a reasoning or code workload.

**The gate and why it cannot be skipped.**

- **CI eval gate** — the operational discipline: a quantized build must pass the real task suite against
  the FP16 baseline before it ships. Its **pass rate over time is the leading indicator** — a gate that
  starts failing on a task you were not otherwise watching is exactly the silent regression the whole
  workflow exists to catch.
- **What is not a gate** — a smaller weight file on disk, a model that loads without throwing, or a
  power-draw number. Those confirm the benefit and basic health; none of them detects a task-quality
  regression.
- **Throughput and memory win** — the benefit side of the ledger, meaningful only when read against the
  quality delta. A big memory win with an unacceptable task delta is a bad trade, not a good one.
- **Reliable low-bit quality prediction is unsolved** — the deepest open problem is that you cannot know
  **in advance** whether a given model at a given bit-width will hold quality before spending the compute
  to quantize and evaluate it. Making the bytes smaller is always possible; knowing the smaller format
  still holds quality is not. So sub-4-bit adoption stays empirical and eval-gated case by case, and a
  blanket "N-bit is fine" is the tell of someone who has not shipped one.
- **Mitigations when the delta is too large** — raise the bit-width, move to per-channel or per-group
  scales, protect the sensitive layer, or fall back from weight-and-activation to weight-only.

**Why it matters.** Gate on the per-task eval delta against the FP16 baseline, read the throughput and
memory win against that delta, and never let a flat perplexity number stand in for either.
