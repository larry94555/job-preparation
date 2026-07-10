# Topic Mastery Index — coverage of the Expert Surface

**Snapshot: 2026-07-09.** Regenerate with `npm run mastery` (parses the machine-readable coverage line
in each `topics/<t>/expert-surface.md`). This is the *content* completeness metric of Goals §8/§9: for
each topic we enumerate the capabilities a SOTA expert commands (the **Expert Surface**) and measure how
much of that surface the course covers. Weighted coverage counts ✅ covered = 1, 🟡 partial = 0.5,
⬜ gap = 0.

| Topic | Items | ✅ | 🟡 | ⬜ | Coverage |
|---|---|---|---|---|---|
| function-calling-reliability | 19 | 17 | 2 | 0 | 95% |
| adaptation-strategy-selection | 20 | 17 | 3 | 0 | 93% |
| eval-methodology | 18 | 15 | 3 | 0 | 92% |
| model-routing-fallback | 18 | 15 | 3 | 0 | 92% |
| quantization-formats-quality | 18 | 15 | 3 | 0 | 92% |
| rag-architecture | 19 | 16 | 3 | 0 | 92% |
| safety-engineering | 19 | 16 | 3 | 0 | 92% |
| speculative-decoding-quant-distillation | 19 | 16 | 3 | 0 | 92% |
| context-engineering | 18 | 15 | 2 | 1 | 89% |
| cost-attribution | 18 | 15 | 2 | 1 | 89% |
| inference-stack-tradeoffs | 19 | 16 | 2 | 1 | 89% |
| kv-cache-management | 18 | 15 | 2 | 1 | 89% |
| prefill-vs-decode-latency | 18 | 15 | 2 | 1 | 89% |
| prompt-vs-semantic-caching | 18 | 15 | 2 | 1 | 89% |
| structured-output-reliability | 20 | 16 | 3 | 1 | 88% |
| agent-guardrails-budgets | 19 | 15 | 3 | 1 | 87% |
| production-failure-modes | 19 | 15 | 3 | 1 | 87% |
| batching-paged-attention-throughput | 18 | 14 | 3 | 1 | 86% |
| harness-engineering | 18 | 14 | 3 | 1 | 86% |
| retrieval-evals | 18 | 14 | 3 | 1 | 86% |
| llm-observability | 19 | 14 | 4 | 1 | 84% |
| multi-tenant-isolation | 18 | 13 | 4 | 1 | 83% |
| **All lesson topics** | **408** | **333** | **61** | **14** | **89%** |

`golang-concurrency` is the item-bank pilot (not a full lesson topic) and has no Expert Surface.

## What the gaps are

Coverage is deliberately **not** 100% — a surface with no gaps would not be a credible SOTA inventory.
WS5 shipped a **reading-list / staying-current module** (`topics/<t>/reading-list.md`) for every topic,
which closed the recurring D7 partial and lifted the index from **86% → 89%**. The remaining 🟡/⬜ items
cluster into three honest, addressable buckets:

1. **Frontier paper drills (D2).** Named in the "Expert context" and reading-list files but without a
   dedicated question set — e.g. cross-request prefix caches (RadixAttention), KV/low-bit quantization
   frontier, GraphRAG, LLM-as-judge calibration.
2. **Missing coding exercises for a taught concept (D5).** Several topics teach a mechanism but only ship
   one runnable exercise — e.g. an eviction-policy allocator, a cross-encoder reranker, an authz-fenced
   retrieval, a chunked-prefill scheduler.
3. **Operational-metrics drills (D6).** Signals are discussed in the deep-dive lessons but not drilled as
   a metrics exercise (KV utilization, per-phase latency, cache hit-rate, stop-reason distribution).

Closing these is incremental content work. The index is designed to *revert* when the surface expands as
the field moves (Goals §8) — that is the point of a continuous course.

## Relationship to learner certification

This index measures **content** coverage (is the material there?). It is distinct from **learner**
certification (has *this* user demonstrated the competency at its target level?), which the runner tracks
per user via mastery bands + spaced repetition — and now a **mastery-over-time + retention analytics** view
(`/api/analytics` in the runner) — and from **eval-skill** certification (can the grader reproduce its own
labels?), which `npm run eval-gate` measures — see [CERTIFICATION.md](CERTIFICATION.md).
