# Batching & paged attention — architecture, tradeoffs, and reviewing a design

You already know static, dynamic, and continuous batching; iteration-level scheduling; paged
attention; and the throughput-vs-latency tension that goodput resolves. This lesson zooms out to the
**design space**: the levers a serving engineer actually pulls, what each one trades away, and how
to judge someone else's batching-and-scheduling design the way an interviewer or a staff engineer in
a design review would.

## The batching-paged-attention-throughput design space

Every serving decision here is really a decision about **how much useful work you keep on the GPU
each step, and at what per-request latency and memory cost**. There are five independent levers, and
real systems combine all of them:

- **Batch formation** — static vs. dynamic vs. **continuous (in-flight)** batching. Static freezes a
  hand-picked group until its longest request finishes; dynamic assembles a batch at admission time
  but still runs it to completion; continuous (Orca-style) re-decides membership **every decoding
  iteration**, so a finished request leaves and a queued one enters at token granularity. This is
  the single biggest structural lever against head-of-line blocking.
- **Scheduling granularity** — once per request vs. **once per iteration**. Iteration-level
  scheduling is the mechanism *underneath* continuous batching: the running set is re-evaluated
  before every forward pass, so no long request can pin a slot past the point a neighbor finished.
- **KV memory layout** — one large **contiguous** per-sequence buffer sized for the worst case vs.
  **paged**, fixed-size, non-contiguous blocks addressed through a per-sequence block table.
  PagedAttention (vLLM) allocates blocks on demand and frees them on completion, nearly eliminating
  fragmentation and max-length over-reservation — which is what lets the effective batch grow.
- **Operating point (batch size)** — how large you let the running batch get. Bigger batches
  amortize weight loads and lift aggregate throughput, but each request shares the GPU with more
  peers, so TPOT and tail latency climb. This is the knob you tune, not a fixed choice.
- **SLO awareness** — whether the scheduler optimizes raw throughput or **goodput** (work completed
  *within* its latency SLO). A goodput-aware scheduler treats the SLO as an admission and
  batch-sizing signal rather than counting every finished request as a win.

## A tradeoff table for batching-paged-attention-throughput

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Static batching | Trivial scheduler, maximal per-step arithmetic density | Head-of-line blocking; batch waits for the longest request; idle slots | Uniform output lengths, offline/batch jobs, benchmarks |
| Dynamic batching | Better admission-time utilization than static, still simple | Membership frozen once a batch starts; HOL blocking only reduced | Moderate variance, latency-tolerant online traffic |
| Continuous batching | Dissolves HOL blocking; batch stays full of useful work; top throughput win | Iteration-level scheduler + per-step overhead; needs flexible KV memory | Any online server with variable output lengths |
| Paged attention (KV) | Near-zero KV fragmentation; more concurrent sequences; enables continuous batching | Block-table bookkeeping, per-step block lookups, allocator complexity | Multi-tenant serving with mixed, growing sequence lengths |
| Larger running batch | Higher aggregate tokens/sec, better weight-load amortization | Rising TPOT and p95; can push requests past their SLO | Throughput-bound, latency-tolerant workloads |
| SLO-aware / goodput scheduling | Caps batch growth at the goodput knee; protects tail latency | Needs SLO definition + per-request latency tracking | Serving under an explicit latency target |

The table is the interview answer in miniature: **name the lever, name what it costs, name the
regime where it wins.** A candidate who says "just turn on continuous batching and crank the batch
size" without naming the latency cost and the goodput ceiling is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** continuous batching + paged attention with a fixed max batch
  size and simple FCFS admission. This is what a default vLLM/TGI/TensorRT-LLM deployment gives you,
  and it is a perfectly good baseline that already beats static batching by a wide margin.
- **SOTA (frontier, worth reaching for under real pressure):** continuous batching + paged attention
  **plus** SLO-aware/goodput scheduling that sizes the running batch to the goodput knee rather than
  a fixed cap, **plus** prefill/decode-aware scheduling so a burst of long prefills does not stall
  decode tail latency, **plus** multi-tenant throughput isolation so one tenant cannot starve the
  others. The frontier is treating the running batch as a scheduling decision driven by SLOs, not a
  constant.
- **Antipattern (looks fine, fails in production):** static batching under variable output lengths;
  reserving a contiguous max-length KV buffer per sequence "to be safe"; optimizing raw throughput
  under a latency SLO (a **batch-blind SLO**) and shipping a server whose p95 quietly violates the
  target; letting a single long-context or long-output request monopolize the batch with no cap.
  Each passes a demo and degrades or misses SLO under real, bursty traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Occupancy is memory-bound, not just compute-bound.** The effective batch size is capped by how
  many KV caches fit in HBM, and each sequence's KV grows one block per generated token. Contiguous
  max-length reservation when the average request uses a fraction of it wastes most of the pool and
  caps concurrency to a handful of users — paging is what converts that wasted HBM back into batch
  size.
- **Throughput and latency move in opposite directions past the knee.** Raising batch size amortizes
  weight loads (higher tokens/sec) but adds contention, so TPOT and p95 rise. There is no single
  operating point that maximizes both; you trade one for the other.
- **Goodput, not throughput, is the objective under an SLO.** Push batch size up only until
  **goodput** stops improving. Beyond that point extra raw throughput comes entirely from requests
  that miss their SLO — the throughput number keeps climbing while goodput falls. SLO-aware
  schedulers use exactly this signal.
- **Prefill and decode compete.** Prefill is compute-heavy and bursty; decode is latency-sensitive
  and steady. Mixing them naively lets a wave of long prefills spike decode TPOT, so scheduling that
  is aware of the two phases protects the tail that goodput measures.

## Reviewing a batching-paged-attention-throughput design

When you are handed a serving design to critique — in a review or an interview — walk the same
checklist:

1. **How is the batch formed?** Static or dynamic under variable output lengths is an immediate flag
   for head-of-line blocking; continuous batching should be the default.
2. **How is the KV cache laid out?** Contiguous max-length reservation in a multi-tenant server caps
   occupancy; paged blocks should be there to make continuous batching actually pack the GPU.
3. **Is there an SLO, and does the scheduler know about it?** A batch-blind SLO — optimizing raw
   throughput under a latency target — means the p95 can silently violate.
4. **What sets the operating batch size?** A fixed cap with no goodput signal leaves latency
   protection to luck; the design should name the goodput knee it targets.
5. **What happens under pressure?** A real design names its admission/queueing policy, caps a single
   request's footprint, and states what the user experiences when the batch is full (queue vs.
   reject vs. degrade) — never "it just works."

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of
these it answers. A toy uses static batching and ignores KV layout; a prototype adds continuous
batching; a demo pages the KV cache; a production-ready design also has an SLO, sizes the batch to
goodput, isolates tenants, and names its pressure policy.
