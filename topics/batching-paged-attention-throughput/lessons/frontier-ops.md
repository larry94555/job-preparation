# Batching & throughput — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
batching from someone who *runs* it at the frontier: where the research edge actually sits, and the
operational signals you watch when the server is live.

## The batching-paged-attention-throughput frontier

Continuous batching is settled science. **Orca** (Yu et al., OSDI 2022) reframed batching from a
per-request to a **per-iteration** decision, and vLLM's paged attention made it practical at scale;
2026 write-ups treat "continuous batching + paged attention" as a single serving bedrock. So the
frontier is no longer *whether* to batch continuously — it's *how the scheduler should decide what to
run each step* once raw throughput is table stakes. Three live directions matter.

- **From throughput to SLO-aware / goodput scheduling.** The step past raw tokens/sec is to size the
  running batch to the **goodput knee** — the point where extra batch stops improving work-completed-
  within-SLO — instead of a fixed cap. A goodput-aware scheduler treats the latency SLO as an admission
  and batch-sizing signal, not as something to discover in the p95 dashboard after the fact. This is
  the accepted way to size a batch now, but turning it into a concrete, robust policy is still active
  work.

- **Multi-tenant fairness and interference as open problems.** These are named in the canon as genuinely
  unsolved. **SLO-fair scheduling** asks how to schedule one shared batch so latency SLOs are met
  *fairly* across requests — reasoning about per-request deadlines rather than a single aggregate
  throughput number. **Multi-tenant throughput isolation** asks how a shared replica keeps one tenant's
  burst from starving another's goodput. Both are the throughput frontier's version of a classic
  isolation/fairness problem, and neither has a settled answer.

- **Chunked prefill and the prefill/decode interaction.** Prefill is compute-heavy and bursty; decode is
  latency-sensitive and steady. Mixing them naively inside one running batch lets a wave of long
  prefills spike decode TPOT. The frontier direction is scheduling that keeps the two phases from
  degrading each other — splitting a long prefill into chunks so it interleaves with decode instead of
  stalling it. Watch for **interference-aware** scheduling, not blanket claims of higher throughput.

The through-line: once continuous batching + paging is a given, every remaining gain comes from a
**smarter per-iteration scheduling decision** — deadline-aware, tenant-aware, and phase-aware — rather
than a bigger batch. An expert can name which of these three a given workload's pain points to first.

## Operating batching in production

When it's live, you don't watch "batching" — you watch a handful of signals that tell you whether the
running batch is doing useful work and where the next wall is.

- **Goodput vs. raw throughput.** Raw tokens/sec keeps climbing as you grow the batch; **goodput** —
  work completed *within* its latency SLO — is the number that matters. When throughput rises while
  goodput flattens or falls, the extra work is all requests missing their SLO. Always read the two
  together; a rising throughput chart alone is a trap.
- **Batch occupancy (running-batch size).** How many sequences are actually decoding each step versus
  the cap. Chronically low occupancy means you're leaving the GPU idle (or memory-bound — paged KV is
  what converts wasted HBM back into batch size); pinned-at-the-cap occupancy under load means you're
  one spike from queueing.
- **Queue depth / wait time.** How many requests are waiting to be admitted and for how long. This is
  your leading capacity signal — rising queue depth shows up as climbing TTFT *before* it shows up as
  outright errors, and it's what should drive admission decisions and autoscaling.
- **Preemption rate.** How often the scheduler evicts or defers a running sequence under memory or SLO
  pressure. Rising preemption is the early warning that the running batch is over-subscribed for the
  offered load — it surfaces as tail-latency spikes ahead of failures.

The operational discipline: alert on **queue depth/wait time and preemption rate** (leading
indicators), capacity-plan on **occupancy and the goodput-vs-throughput gap**, and never declare
victory on a raw-throughput number when the SLO — and therefore goodput — is the real objective.
