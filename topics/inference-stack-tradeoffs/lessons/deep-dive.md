# Inference stack — architecture, tradeoffs, and reviewing a design

You already know the four coupled axes (latency, quality, cost, reliability), the per-layer levers and
their dominant axis, and how SLOs anchor the design and decompose into per-stage budgets. This lesson
zooms out to the **design space**: the levers a serving engineer actually pulls, what each one trades
away, and how to judge someone else's inference-stack design the way an interviewer or a staff engineer
in a design review would.

## The inference-stack-tradeoffs design space

Every stack decision is really a decision about **where on the latency/quality/cost/reliability
frontier you sit, given a fixed SLO and a fixed hardware budget**. There is no single defining paper
here — the topic is **integrative**: it composes the serving systems from the throughput and latency
topics and asks how they *interact*. There are five families of lever, and real stacks combine them:

- **Batching** — static vs. **continuous / iteration-level** batching (**Orca**). Continuous batching
  amortizes fixed GPU work across many in-flight requests, so cost-per-token drops and throughput
  climbs. The bill is paid in **tail latency**: a request can wait for the batch to fill, so p99 rises
  even as the mean improves.
- **Memory / KV** — paged attention (**vLLM**) turns wasted HBM back into concurrency, which is what
  lets big batches actually run. KV pressure is often the real cap on how many sequences you can hold,
  so this lever quietly gates the batching lever above it.
- **Phase scheduling** — chunked prefill (**Sarathi**) and prefill/decode balancing let you hit
  **separate** TTFT and TPOT targets instead of a single blended latency number. This is the lever you
  reach for when prefill-bound and decode-bound traffic are fighting for the same GPU.
- **Precision** — **quantization** (FP16 → INT8/INT4). Smaller weights cut cost and memory and often
  latency, buying you headroom on every axis except the one that pays: **quality**, by an amount you
  must *measure*, not assume.
- **Routing / reliability** — **FrugalGPT-style cost/quality cascades** (route easy requests to a cheap
  model, escalate hard ones) and **fallback** paths (retry, backup model, second provider). Cascades
  buy cost at a routing-accuracy risk; fallback buys availability at the cost of redundancy and
  sometimes latency on the retry path.

The **roofline** model sits underneath all of this: knowing whether a workload is compute-bound or
memory-bandwidth-bound tells you which lever can actually move the needle, so you don't, say, add
compute to a memory-bound decode phase.

## A tradeoff table for inference-stack-tradeoffs

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Continuous batching (Orca) | Higher throughput, lower cost-per-token | Higher tail (p99) latency as requests wait for the batch | Throughput/cost-bound with latency headroom |
| Paged KV (vLLM) | More concurrency from the same HBM, enables big batches | Allocator complexity; still KV-capped on long contexts | Any multi-tenant server; concurrency is KV-bound |
| Chunked prefill / P-D balance (Sarathi) | Meets separate TTFT and TPOT SLOs at once | Scheduler complexity; some throughput given back | Prefill- and decode-bound traffic share a GPU |
| Quantization (INT8/INT4) | Lower cost/memory, often lower latency | Quality risk that must be evaluated, not assumed | Cost/memory-bound with a validated quality floor |
| Cost/quality cascade (FrugalGPT) | Big cost cut by escalating only hard requests | Routing-accuracy risk; degraded answers if misrouted | Cost-dominant workload with variable difficulty |
| Fallback / redundancy | Availability and graceful degradation | Extra cost from redundancy; latency on the retry path | Reliability is a first-class SLO |

The table is the interview answer in miniature: **name the lever, name what it costs, name the SLO
regime where it wins.** A candidate who says "just turn on continuous batching to make serving faster
and cheaper" without naming the tail-latency bill is signalling shallow depth — that "free lunch"
framing is itself the red flag.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** continuous batching + paged KV + FP16, sized against a single
  blended latency target. This is what a default vLLM/TGI deployment gives you and it is a perfectly
  good baseline for a moderate workload.
- **SOTA (frontier, worth reaching for under real pressure):** **SLO-anchored** stack design — fix the
  TTFT/TPOT/p99, availability, and quality-floor targets *first*, decompose the end-to-end budget into
  per-stage sub-budgets, then compose levers to hit them, treating the whole thing as a **joint
  latency/cost/quality/reliability optimization**. Add chunked prefill / P-D balancing for separate
  latency SLOs, a FrugalGPT cascade for cost, quantization gated behind an eval, and fallback for the
  availability SLO. The frontier is optimizing *the whole Pareto frontier at once, honestly*.
- **Antipattern (looks fine, fails in production):** **single-metric optimization** — tuning
  throughput while tail latency or quality quietly regresses; **"free lunch" claims** — any
  faster/cheaper answer with no tradeoff named; **premature optimization** before the SLOs are even
  set; and **ignoring the reliability cost** of the levers you add. Each passes a demo and blows an
  *unmeasured* axis under real traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **The axes are coupled, so plan in all four at once.** A config chosen to win one number almost
  always pushes an unmeasured axis past its limit. Double the batch size and throughput rises but so
  does p99; halve the precision and cost drops but quality may drift on the workloads you didn't test.
- **Concurrency is KV-bound, not purely compute-bound.** The number of sequences you can batch is
  capped by the KV pool, and per-sequence KV grows with context length. Longer average contexts shrink
  the batch, which shrinks the throughput win — batching and KV levers are entangled, not independent.
- **Budgets are additive; find the overrun before you optimize.** An end-to-end p99 SLO is the *sum* of
  per-stage sub-budgets (network + queue + retrieval + prefill + decode). Measure each stage's p99
  against its sub-budget, find the stage that overran, and apply the lever whose **dominant axis** fixes
  *that* stage — don't optimize a stage that already fits.
- **Cost scales with routed difficulty, not request count.** A FrugalGPT cascade means most easy
  requests never touch the expensive model, so cost-per-successful-task — not cost-per-model — is the
  unit that actually moves. The catch is routing accuracy: a misrouted hard request degrades quality,
  so the cost win must be validated against the quality floor.

## Reviewing an inference-stack-tradeoffs design

When you are handed a stack design to critique — in a review or an interview — walk the same checklist:

1. **Are there SLOs, and were they set first?** No TTFT/TPOT/p99, availability, and quality-floor
   targets means the design is optimizing a number in a vacuum — stop there.
2. **Is the end-to-end budget decomposed?** A design that can't say which stage owns which slice of the
   latency budget can't tell you where to spend a lever.
3. **Is every lever's bill named?** Batching's tail latency, quantization's quality risk, the cascade's
   routing risk, fallback's cost — a lever with no stated tradeoff is a "free lunch" claim.
4. **Was any precision or routing change *evaluated*?** Quantization or a cascade shipped without a
   quality eval on the real workload is a silent-regression waiting to happen.
5. **Is reliability first-class?** A real design names its degraded-mode behaviour and availability
   path under load or failure — never "it just works," and never reliability bolted on at the end.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A toy optimizes one metric and ignores the rest; a prototype names the four axes; a
demo-ready design anchors on SLOs and decomposes the budget; a **production-ready** design also names
every lever's bill, gates precision/routing changes behind an eval, and treats reliability as a
first-class SLO with a stated degraded-mode path.
