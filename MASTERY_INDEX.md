# Topic Mastery Index — coverage of the Expert Surface

**Snapshot: 2026-07-10.** Regenerate with `npm run mastery` (parses the machine-readable coverage line
in each `topics/<t>/expert-surface.md`). This is the *content* completeness metric of Goals §8/§9: for
each topic we enumerate the capabilities a SOTA expert commands (the **Expert Surface**) and measure how
much of that surface the course covers. Weighted coverage counts ✅ covered = 1, 🟡 partial = 0.5,
⬜ gap = 0.

## Topic Mastery Index = **100%** — all 22 lesson topics fully covered (456 / 456 enumerated items)

| Topic | Items | ✅ | 🟡 | ⬜ | Coverage |
|---|---|---|---|---|---|
| adaptation-strategy-selection | 20 | 20 | 0 | 0 | 100% |
| agent-guardrails-budgets | 21 | 21 | 0 | 0 | 100% |
| batching-paged-attention-throughput | 21 | 21 | 0 | 0 | 100% |
| context-engineering | 21 | 21 | 0 | 0 | 100% |
| cost-attribution | 18 | 18 | 0 | 0 | 100% |
| eval-methodology | 21 | 21 | 0 | 0 | 100% |
| function-calling-reliability | 21 | 21 | 0 | 0 | 100% |
| harness-engineering | 20 | 20 | 0 | 0 | 100% |
| inference-stack-tradeoffs | 20 | 20 | 0 | 0 | 100% |
| kv-cache-management | 21 | 21 | 0 | 0 | 100% |
| llm-observability | 22 | 22 | 0 | 0 | 100% |
| model-routing-fallback | 21 | 21 | 0 | 0 | 100% |
| multi-tenant-isolation | 21 | 21 | 0 | 0 | 100% |
| prefill-vs-decode-latency | 20 | 20 | 0 | 0 | 100% |
| production-failure-modes | 21 | 21 | 0 | 0 | 100% |
| prompt-vs-semantic-caching | 21 | 21 | 0 | 0 | 100% |
| quantization-formats-quality | 21 | 21 | 0 | 0 | 100% |
| rag-architecture | 21 | 21 | 0 | 0 | 100% |
| retrieval-evals | 22 | 22 | 0 | 0 | 100% |
| safety-engineering | 20 | 20 | 0 | 0 | 100% |
| speculative-decoding-quant-distillation | 21 | 21 | 0 | 0 | 100% |
| structured-output-reliability | 21 | 21 | 0 | 0 | 100% |
| **All lesson topics** | **456** | **456** | **0** | **0** | **100%** |

`golang-concurrency` is the item-bank pilot (not a full lesson topic) and has no Expert Surface.

## How it got here

The index climbed **89% → 97% → 99% → 100%** across the A+ push:
- **Frontier & operations drills** on every topic (closing the D2 frontier-paper-drill and D6
  operational-metrics partials).
- **Independent web-verification** of every topic's canon (zero corrections) plus a **"Reception & what
  aged"** layer on each reading list (Goals C2.2).
- **23 sandbox-verified D5 coding exercises** — every taught concept now has a runnable, tested exercise
  (Cohen's κ, nDCG, cost/route cascades, rerank funnel, per-channel quant, draft/verify, chunked prefill,
  compaction, scoped retrieval + per-tenant quota, loop detector, action-gate, schema enforcement,
  provenance fencing, block-table mapping, arg-repair, span-tree, grounding check, …).
- The single former **open-problem gap** (attribution-at-scale) is now covered *as* an open problem — the
  course teaches that it is unsolved and drills the current best-effort approaches, which is the honest
  expert position.

The index is designed to **revert** as the field's frontier expands (Goals §8) — 100% is "complete as of
this dated snapshot," not "finished forever." That is the point of a continuous course.

## Relationship to learner certification

This index measures **content** coverage (is the material there?). It is distinct from **learner**
certification (has *this* user demonstrated the competency?), tracked per user via mastery bands + spaced
repetition + the runner's analytics view, and from **eval-skill** certification (can the grader reproduce
its own labels? — 44/46 on the pinned Qwen2.5-3B), measured by `npm run eval-gate`. See
[CERTIFICATION.md](CERTIFICATION.md).
