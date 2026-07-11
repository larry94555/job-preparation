# Prefill vs. decode — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
prefill/decode from someone who *runs* it at the frontier: where the scheduling research is actually
moving, and the operational signals you watch when it's live.

## The prefill-vs-decode-latency frontier

The canon (chunked prefill, P/D disaggregation) is settled enough to be a default knob. Three directions
are where the serving research is still moving.

- **Chunked prefill as the interleaving primitive — Sarathi.** The idea that made one GPU serve both
  phases well: slice a long prompt's prefill into chunks and **interleave** them with ongoing decode, so
  no single prefill monopolizes a step and spikes everyone's TPOT. This won and became a standard
  scheduling option, but it opened the harder question — *how big should a chunk be, and when should a
  decode step yield to a prefill chunk?* — which is exactly what the SLO-scheduling frontier below is
  about.
- **Prefill/decode disaggregation — DistServe and Splitwise.** Both (2024) argue the two phases have
  **opposite resource profiles** — prefill is compute-bound, decode is memory-bandwidth-bound — so
  co-locating them forces a shared scheduler to serve two workloads that optimize differently.
  Disaggregation puts prefill and decode on **separate resource pools**, each scaled and scheduled for
  its own SLO, and ships the KV state built during prefill over to the decode tier. The nuance that
  aged in: it is **not free** — KV transfer cost and bursty, imbalanced arrivals mean it pays off in
  specific regimes, not universally. So the live judgment is *when* to disaggregate, not *whether* it is
  always better.
- **SLO-optimal P/D scheduling & phase interference — the open problems.** Two questions the canon
  explicitly flags as unsolved. First, **SLO-optimal scheduling**: given per-request TTFT *and* TPOT
  targets, how do you order prefill chunks and decode steps to hit *both* — treating the two SLOs as a
  joint objective rather than tuning one and hoping the other holds? Second, **cross-phase
  interference**: when prefill and decode share a GPU, a burst of prefill stalls decode (and vice
  versa). Disaggregation *sidesteps* this by paying for separate hardware; the frontier is to **model
  and predict** the stall so a co-located scheduler can avoid it without the transfer tax.

The reason to track this line specifically: chunked prefill and disaggregation are two answers to the
same conflict (two phases, two SLOs, one set of GPUs) — *interleave them cheaply* vs. *separate them
outright*. An expert can say which one a given workload should reach for, and can name that neither has
solved the joint-SLO scheduling problem underneath.

## Operating prefill and decode in production

When it's live, you don't watch "latency" — you watch a handful of per-phase signals that tell you which
phase is missing its SLO and where the next wall is. The cardinal rule from the topic carries straight
into ops: **never collapse the two phases into one number.**

- **TTFT percentiles (p50/p95/p99).** The prefill-side SLO. Time-to-first-token is set by prompt length
  and prefill scheduling; watch the *tail*, not the mean, because a few long prompts arriving during
  active decode are what blow p99. A rising TTFT p95 at steady request rate points at prefill
  contention, not decode.
- **TPOT / ITL percentiles (p50/p95/p99).** The decode-side SLO — time-per-output-token / inter-token
  latency. This is what users feel as streaming smoothness. A TPOT p95 spike that correlates with large
  prompts arriving is the signature of a **monolithic prefill stalling in-flight decode** — the exact
  problem chunked prefill exists to bound.
- **Prefill vs. decode queue depth.** Track the two queues *separately*. A deep prefill queue with a
  shallow decode queue means you're prefill-bound (TTFT will slip); the reverse means decode-bound (TPOT
  will slip). One combined "pending requests" number hides which phase is the bottleneck and sends you to
  the wrong lever.
- **Batch composition (prefill tokens vs. decode tokens per step).** How much of each GPU step is spent
  on prefill chunks vs. decode. This is the operational readout of your chunked-prefill tuning: too much
  prefill per step starves decode (TPOT climbs); too little slows prompts through (TTFT climbs). It is
  the dial you actually turn to trade one SLO against the other.
- **SLO-attainment rate (per phase).** The headline health metric: the fraction of requests meeting the
  TTFT target *and* the fraction meeting the TPOT target, reported separately. This is what you alert and
  autoscale on, and — mirroring the topic's whole lesson — it is **two attainment numbers, not one**.

The operational discipline: alert on **per-phase SLO-attainment and the TTFT/TPOT tails** (leading
indicators of a phase missing its target), diagnose with **per-phase queue depth and batch composition**
(which phase is bound and why), and benchmark the two SLOs separately (e.g. GenAI-Perf) — never reason
about serving latency as a single number when the real currency is **two phase-specific budgets**.
