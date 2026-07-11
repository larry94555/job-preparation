# Reading list & staying current — batching-paged-attention-throughput

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **Orca: iteration-level (continuous) batching — Yu et al. (OSDI 2022).** The paper that reframed batching
  from a per-request to a per-iteration decision. Notice that scheduling at each decode step lets finished
  sequences leave and waiting ones join mid-flight — this is what kills head-of-line blocking under variable
  output lengths. This is the single most important read for the topic.
- **PagedAttention / vLLM — Kwon et al. (2023).** The paged-KV system that made continuous batching practical
  at scale. Notice the OS virtual-memory analogy: fixed-size blocks plus a block table kill fragmentation, so
  wasted HBM converts back into effective batch size. Batching and KV management are the same problem viewed
  from two sides.

## Go deeper (mechanism & attention structure)
- **FlashAttention — Dao et al. (2022).** The IO-aware attention kernel underneath modern serving. Notice it
  changes *how* attention is computed (tiling, no materialized N×N matrix) — a kernel-level lever that is
  distinct from batching and KV storage but compounds with both.
- **SLO-aware / goodput scheduling.** The step past raw tokens/sec: size the operating batch to the goodput
  knee rather than maximizing throughput blindly. Notice that bigger batches lift tokens/sec but raise
  TPOT/p95 — goodput is the metric that respects the latency SLO instead of ignoring it.

## Frontier — what to watch
- **SLO-fair scheduling.** The open question is how to schedule a shared batch so latency SLOs are met
  *fairly* across requests, not just on average. Watch for scheduling policies that reason about per-request
  deadlines rather than a single aggregate throughput number.
- **Multi-tenant throughput isolation.** Treating a shared serving replica as something that must isolate
  tenants from each other's load. Notice this is the throughput frontier's version of a classic isolation
  problem — one tenant's burst should not starve another's goodput.
- **Prefill-vs-decode interference.** The frontier is scheduling that keeps prefill and decode from degrading
  each other inside the same running batch. Watch for interference-aware scheduling, not blanket claims of
  higher throughput.

## Tools & implementations worth reading
- **vLLM, TGI, TensorRT-LLM, SGLang, LMDeploy** — the serving stacks that do continuous batching + paged
  attention. Reading vLLM's scheduler and block manager is the fastest way to turn Orca and PagedAttention
  into a mental model of real code.

## How to stay current on this topic
- Follow the **vLLM / TGI / TensorRT-LLM / SGLang / LMDeploy** repos and release notes — batching and
  scheduling features land in code first.
- Track **MLSys, OSDI/SOSP, and NeurIPS/ICML systems tracks** for the next continuous-batching / paging /
  goodput-scheduling idea.
- When a new scheduling technique appears, ask the three canon questions: *what does it trade (throughput/
  latency/fairness), what regime does it win in, and what eval proves it?* — the same lens the deep-dive
  lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **Continuous batching is now table stakes.** Orca's iteration-level scheduling (OSDI 2022) went from novel
  to universal: it's the default in vLLM, TGI, SGLang, and TensorRT-LLM (as inflight batching). Static
  batching under variable output lengths is now the textbook anti-pattern — exactly the canon red flag. The
  Orca entry aged as well as any in the curriculum.
- **Orca + PagedAttention fused into one standard paradigm.** The two were separate papers; in practice they
  are inseparable — 2025/2026 write-ups treat "continuous batching + paged attention" as a single serving
  bedrock, and vLLM's combination of the two is the reference implementation the rest of the field is
  measured against.
- **The throughput claims held; the framing shifted to goodput.** The ~2–4× throughput / larger-batch gains
  reproduced widely, but the field moved past raw tokens/sec: goodput / SLO-aware scheduling (the canon's
  "step past raw throughput") is now the accepted way to size a batch, validating that frontier bullet.
- **FlashAttention became a hard dependency, not an optional kernel.** Dao's IO-aware kernel (2022) and its
  successors (FlashAttention-2/3, FlashInfer) are now assumed underneath serving stacks — a compounding
  lever, as the canon framed it, rather than a competing one.
- **What to watch next:** the open problems the canon named — SLO-*fair* scheduling, multi-tenant throughput
  isolation, and prefill/decode interference inside a shared batch — are still genuinely unsolved and are
  where 2026 scheduling research (per-deadline / congestion-aware policies) is concentrated.
