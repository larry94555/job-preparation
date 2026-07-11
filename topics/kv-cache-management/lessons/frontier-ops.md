# KV cache — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
KV cache from someone who *runs* it at the frontier: the current research edge, and the operational
signals you watch when it's live.

## The KV-cache frontier

Two research directions are where KV work is actually moving right now.

- **Low-bit KV quantization.** Halving the KV dtype roughly doubles the sequences you can hold, so the
  race is to go below fp16 without wrecking long-context quality. The load-bearing finding across this
  line of work (KIVI, KVQuant, and successors) is that **the keys carry channel-wise outliers** — a few
  channels have huge magnitudes — and those outliers are what make naive low-bit quantization fall
  apart. The techniques differ in how they handle it: **KIVI** quantizes keys **per-channel** (and
  values per-token) to isolate the outlier channels; **KVQuant** uses **non-uniform** quantization so
  the few large values keep resolution. The practical takeaway: KV quantization is real capacity, but
  the win is gated by a long-context eval, and "just int4 the cache" without outlier handling is the
  classic way to ship a silent regression.

- **Cross-request KV reuse.** vLLM's PagedAttention shares a *prefix* within copy-on-write blocks; the
  frontier generalizes this to **automatic reuse across requests**. **SGLang's RadixAttention** keeps
  every request's KV in a **radix tree** with an **LRU eviction policy**, so any new request that shares
  a prefix with a past one reuses those blocks — cutting prefill compute and TTFT. On workloads with
  high prefix overlap (shared system prompts, few-shot templates, multi-turn chat) this turns a
  per-request cost into a near-free cache hit. The mental model to carry: **the KV cache is becoming
  cluster-level state**, not per-replica scratch — which is also why prefill/decode disaggregation and
  shared prefix caches keep showing up together.

The reason to track this line specifically: both directions attack the same bottleneck (KV bytes cap
concurrency) from different angles — *make each token cheaper* (quantization) vs. *pay for shared tokens
once* (reuse). An expert can say which one a given workload should reach for first.

## Operating a KV cache in production

When it's live, you don't watch "KV cache" — you watch a handful of signals that tell you whether the
pool is healthy and where the next capacity wall is.

- **KV pool utilization (% of blocks allocated).** The headline gauge. Sustained utilization near 100%
  means you're one traffic spike from preemption; chronically low means you over-provisioned HBM.
- **Preemption / eviction rate.** How often the scheduler evicts or recomputes a running sequence's KV
  under pressure. Rising preemption is the leading indicator that the pool is too small for the offered
  load — it shows up as latency spikes *before* it shows up as errors.
- **Admission rejects / queue depth.** Requests refused or waiting because there aren't enough free
  blocks to admit them. This is your "capacity exceeded" signal and should drive autoscaling.
- **Average context length & its trend.** Because concurrency ≈ pool / bytes-per-sequence and
  bytes-per-sequence grows with context, a creeping average context length silently halves your
  concurrency. Capacity planning must track it, not just request rate.

The operational discipline: alert on **preemption rate and admission rejects** (leading indicators),
capacity-plan on **utilization and average context length**, and never reason about serving capacity in
"requests" when the real currency is **KV tokens**.
