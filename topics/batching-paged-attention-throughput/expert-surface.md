# Expert Surface — batching-paged-attention-throughput

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain static vs. dynamic vs. continuous batching and why head-of-line blocking wastes the GPU — `lessons/batching.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: continuous/in-flight batching, iteration-level scheduling, paged attention, block table, goodput, TTFT/TPOT — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Translate between altitudes (OS virtual-memory paging analogy ↔ non-contiguous KV blocks + block table) — `lessons/scheduling-paging.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** Iteration-level (continuous) batching → Orca (Yu et al., OSDI 2022) as the origin — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Paged KV → vLLM / PagedAttention (Kwon et al., 2023) and why it enables continuous batching — `lessons/scheduling-paging.md`, `lessons/expert-context.md`.
- ✅ **[L3]** FlashAttention (Dao, 2022) as the IO-aware attention kernel underneath, distinct from batching/KV storage — `lessons/expert-context.md`.
- 🟡 **[L4]** SLO-fair scheduling / multi-tenant throughput isolation / interference as live open problems — named in `lessons/expert-context.md` and `lessons/deep-dive.md`; no dedicated frontier drill.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five levers (batch formation, scheduling granularity, KV layout, operating batch size, SLO awareness) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern ladder for a serving/batching design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a batching design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Occupancy is memory-bound: paged KV converts wasted HBM back into effective batch size — `lessons/scheduling-paging.md`, `lessons/deep-dive.md`.

## D4 — Problem solving
- ✅ **[L3]** Reason about throughput-vs-latency: why bigger batches lift tokens/sec but raise TPOT/p95, and where the goodput knee sits — `lessons/throughput.md`, `questions/free-entry.yaml`.
- ✅ **[L3]** Diagnose a static-batch server under variable output lengths to head-of-line blocking and choose continuous batching + paging — `lessons/batching.md`, `lessons/deep-dive.md`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a continuous-batching scheduler (active set ≤ batchSize, per-step decrement, free-and-refill, makespan) — `exercises/continuous-batching`, `questions/code.yaml`.
- 🟡 **[L4]** Implement a paged block allocator / block-table mapping for KV memory — described in `lessons/scheduling-paging.md`; no dedicated coding exercise in this topic.
- 🟡 **[L4]** Implement SLO-aware/goodput admission that sizes the batch to the knee — taught in `lessons/throughput.md` and `lessons/deep-dive.md`; no coding exercise.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** vLLM / TGI / TensorRT-LLM / SGLang / LMDeploy as the serving stacks that do continuous batching + paging — `lessons/batching.md`, `lessons/expert-context.md`.
- 🟡 **[L3]** Operational signals (running-batch size, goodput vs. raw throughput, TPOT/p95, prefill-vs-decode interference) — discussed in `lessons/throughput.md`, `lessons/deep-dive.md`; not drilled as metrics.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the throughput frontier moves (SLO-fair scheduling, multi-tenant isolation, P/D-aware scheduling) and how to track it — `reading-list.md`, pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags on batching/throughput (what continuous batching solves; batch-blind SLOs) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a high-throughput serving path (continuous batching + paged attention + SLO-aware scheduling) under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
18 items · ✅ 14 covered · 🟡 3 partial · ⬜ 1 gap. Weighted coverage (covered=1, partial=0.5) ≈ **86%**.
Open frontier work: an SLO-fair / multi-tenant-isolation frontier drill, a paged-block-allocator coding
exercise, an SLO-aware/goodput admission coding exercise, and an operational-metrics drill.

<!-- coverage: items=18 covered=14 partial=3 gap=1 -->
