# KV cache — architecture, tradeoffs, and reviewing a design

You already know what the KV cache is, how to size it, and how paging and eviction let many
sequences share one pool. This lesson zooms out to the **design space**: the levers a systems
engineer actually pulls, what each one trades away, and how to judge someone else's KV design the
way an interviewer or a staff engineer in a design review would.

## The KV cache design space

Every KV decision is really a decision about **how many concurrent sequences you can hold in a fixed
pool of HBM, and at what latency and quality cost**. There are five independent levers, and real
systems combine them:

- **Layout** — contiguous per-sequence buffers vs. **paged** fixed-size blocks. Contiguous is simple
  and cache-friendly but forces you to reserve `max_seq_len` up front, so internal fragmentation
  wastes most of the pool. Paging (PagedAttention/vLLM) allocates blocks on demand, cutting waste to
  at most one partial block per sequence.
- **Attention sharing** — **MHA vs. GQA vs. MQA**. Grouped-query and multi-query attention shrink the
  *number of KV heads*, which is a direct multiplier on KV bytes. Going from 32 KV heads to 8 (GQA)
  quarters the cache; MQA (1 KV head) is an 8× cut vs. that GQA config. This is the single biggest
  structural lever and it is chosen at *training* time, not serving time.
- **Precision** — **KV quantization** (fp16 → int8/fp8, or int4 for the cache). Halving KV dtype
  roughly doubles the sequences you can hold, at some quality risk on long contexts.
- **Placement** — keep KV in HBM, **offload** cold blocks to host RAM/NVMe, or **recompute** on
  demand. Offload buys capacity at the cost of PCIe bandwidth and tail latency.
- **Reuse** — **prefix sharing**: two requests with the same system prompt point at the same KV
  blocks (copy-on-write). This turns a per-request cost into a shared one for common prefixes.

## A tradeoff table for KV strategies

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Contiguous buffers | Simplicity, no block bookkeeping | Reserve `max_len` → huge internal fragmentation, low concurrency | Prototypes, single-user, fixed short lengths |
| Paged blocks | Near-zero fragmentation, high concurrency, enables prefix sharing | Allocator complexity, per-step block lookups | Any multi-tenant production server |
| GQA / MQA | 4–8× smaller KV, more concurrency for free at serve time | Chosen at train time; slight quality vs. full MHA | Designing/choosing the model for serving |
| KV quantization (int8/fp8) | ~2× capacity, longer contexts fit | Quality drift on long context; needs eval | HBM-bound, contexts long, quality budget exists |
| Offload to host/NVMe | Capacity beyond HBM | PCIe-bound, tail-latency spikes on cold blocks | Bursty long-context traffic, capacity > latency |
| Prefix / prompt sharing | Free capacity for shared system prompts | Copy-on-write bookkeeping, invalidation care | Many requests share a large fixed prefix |

The table is the interview answer in miniature: **name the lever, name what it costs, name the
regime where it wins.** A candidate who says "just quantize the KV cache" without naming the quality
risk and the eval you'd run is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** paged KV blocks + GQA + fp16 cache, with a simple LRU/FIFO
  eviction of the lowest-priority sequences under pressure. This is what a default vLLM/TGI
  deployment gives you and it is a perfectly good baseline.
- **SOTA (frontier, worth reaching for under real pressure):** paging **plus** prefix/prompt sharing
  with copy-on-write, **plus** fp8/int8 KV quantization gated by a long-context eval, **plus**
  KV-aware scheduling so admission control considers *KV headroom*, not just request count — and, for
  very long contexts, offload/recompute tiers. The frontier is treating KV as the *scheduling
  currency* of the whole server.
- **Antipattern (looks fine, fails in production):** budgeting capacity from **weights only** and
  ignoring per-token KV; reserving `max_seq_len` contiguously "to be safe"; letting a single
  long-context request monopolize the pool with no per-tenant cap; or quantizing KV with **no eval**
  and shipping silent quality regressions. Each of these passes a demo and OOMs or degrades under
  real traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Concurrency is KV-bound, not compute-bound.** Max concurrent sequences ≈ `KV_pool_bytes /
  bytes_per_sequence`, and `bytes_per_sequence` grows linearly with context length. Double the
  average context and you halve concurrency — throughput planning must be done in *KV tokens*, not
  requests.
- **Fragmentation is a throughput tax.** Contiguous reservation at `max_len` when the average request
  uses 10% of it wastes ~90% of the pool — you pay for a big GPU and serve a handful of users. Paging
  is what converts that wasted HBM back into concurrency.
- **Quantization vs. concurrency is roughly linear.** int8 KV ≈ 2× the sequences of fp16; fp8 similar
  with better numerics. The catch is that KV quantization error compounds over long contexts, so the
  win must be validated with a long-context quality eval, not a short-prompt smoke test.
- **Prefix sharing scales with prompt reuse.** If 1,000 requests share a 2,000-token system prompt,
  naive serving pays 2,000 tokens of KV a thousand times; copy-on-write prefix sharing pays it once.

## Reviewing a KV design in an interview

When you are handed a KV design to critique — in a review or an interview — walk the same checklist:

1. **Where does the capacity number come from?** If it counts weights and not per-token KV, stop
   there; the plan will OOM.
2. **Contiguous or paged?** Contiguous in a multi-tenant server is an immediate flag.
3. **What caps a single sequence?** No per-request/per-tenant KV cap means one long context starves
   everyone (a head-of-line problem).
4. **Any precision or sharing wins left on the table?** GQA/MQA chosen? KV quantization considered
   and *evaluated*? Shared prefixes deduplicated?
5. **What happens under pressure?** A real design names its eviction/admission policy and what the
   user experiences when the pool is full (queue vs. reject vs. degrade) — never "it just works."

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of
these it answers. A toy ignores KV entirely; a prototype sizes it; a demo pages it; a
production-ready design also bounds per-tenant usage, has a pressure policy, and gates any
quantization behind an eval.
