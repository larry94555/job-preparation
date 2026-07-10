# Inference-stack tradeoffs — per-layer levers

## Levers and their dominant axis

Each layer of the stack gives you a lever, and each lever has a **dominant axis** — the thing it
mainly moves — and a bill it pays elsewhere. Knowing the dominant axis lets you reach for the right
lever when a specific axis is out of budget.

- **Batching** (e.g. continuous batching) — dominant axis: **throughput / cost**. It amortizes fixed
  GPU work across many requests, so cost-per-token falls. The bill: **latency**, especially the tail,
  because a request may wait for the batch to fill.
- **Quantization** (FP16 → INT8/INT4) — dominant axis: **cost / memory** (often latency too). Smaller
  weights fit more on a GPU and run faster. The bill: **quality**, since reduced numerical precision
  can degrade outputs by an amount you must measure.
- **Caching** (response or prefix cache) — dominant axis: **latency and cost on hits**. A hit returns
  prior work instead of recomputing it. The bill: possible **staleness** and the operational cost of
  invalidation and hit-rate management.
- **Speculative decoding** (a small draft model proposes tokens the target verifies) — dominant axis:
  **latency**, at unchanged quality (the target's distribution is preserved). The bill: extra
  **compute/memory** to run and verify the draft model.
- **Fallback** (retry, backup model, or a second provider) — dominant axis: **reliability /
  availability**. The bill: **cost** from redundancy, and sometimes added **latency** on the retry
  path.

## Choosing the right lever

Because each lever has a known dominant axis, tuning becomes targeted rather than trial-and-error.
Latency SLO blown but cost has headroom? Consider speculative decoding or caching before you reach for
a bigger, more expensive box. Cost too high with quality headroom? Quantize, and validate the quality
drop against your evals. Availability too low? Add a fallback, and account for its cost and latency.

The discipline is to name the axis you need to move, pick the lever whose dominant axis matches, and
then check what that lever's bill does to the **other three** axes — so you don't fix latency by
quietly breaking your quality floor or your cost budget.
