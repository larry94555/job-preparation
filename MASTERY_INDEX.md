# Topic Mastery Index — coverage of the Expert Surface

**Snapshot: 2026-07-10.** Regenerate with `npm run mastery` (parses the machine-readable coverage line
in each `topics/<t>/expert-surface.md`). This is the *content* completeness metric of Goals §8/§9: for
each topic we enumerate the capabilities a SOTA expert commands (the **Expert Surface**) and measure how
much of that surface the course covers. Weighted coverage counts ✅ covered = 1, 🟡 partial = 0.5,
⬜ gap = 0.

**17 of 22 lesson topics are at 100%; the Topic Mastery Index is 99%.**

| Topic | Items | ✅ | 🟡 | ⬜ | Coverage |
|---|---|---|---|---|---|
| adaptation-strategy-selection | 20 | 20 | 0 | 0 | 100% |
| agent-guardrails-budgets | 21 | 21 | 0 | 0 | 100% |
| context-engineering | 21 | 21 | 0 | 0 | 100% |
| cost-attribution | 18 | 18 | 0 | 0 | 100% |
| eval-methodology | 21 | 21 | 0 | 0 | 100% |
| function-calling-reliability | 21 | 21 | 0 | 0 | 100% |
| inference-stack-tradeoffs | 20 | 20 | 0 | 0 | 100% |
| kv-cache-management | 21 | 21 | 0 | 0 | 100% |
| model-routing-fallback | 21 | 21 | 0 | 0 | 100% |
| prefill-vs-decode-latency | 20 | 20 | 0 | 0 | 100% |
| production-failure-modes | 21 | 21 | 0 | 0 | 100% |
| prompt-vs-semantic-caching | 21 | 21 | 0 | 0 | 100% |
| quantization-formats-quality | 21 | 21 | 0 | 0 | 100% |
| rag-architecture | 21 | 21 | 0 | 0 | 100% |
| safety-engineering | 20 | 20 | 0 | 0 | 100% |
| speculative-decoding-quant-distillation | 21 | 21 | 0 | 0 | 100% |
| structured-output-reliability | 21 | 21 | 0 | 0 | 100% |
| batching-paged-attention-throughput | 21 | 20 | 1 | 0 | 98% |
| harness-engineering | 20 | 19 | 1 | 0 | 98% |
| multi-tenant-isolation | 21 | 20 | 1 | 0 | 98% |
| llm-observability | 22 | 19 | 3 | 0 | 93% |
| retrieval-evals | 22 | 20 | 1 | 1 | 93% |
| **All lesson topics** | **456** | **448** | **7** | **1** | **99%** |

`golang-concurrency` is the item-bank pilot (not a full lesson topic) and has no Expert Surface.

## What's left (the 8 residual items)

The index rose **89% → 97% → 99%** across the A+ push: frontier + operations drills on every topic,
independent web-verification of the canon (zero corrections), reception layers, and **19 sandbox-verified
D5 coding exercises**. The remaining 8 items are deliberately left honest:

- **A second coding exercise where the first already covers the concept** — `batching` (a paged block-table
  mapping, already drilled by kv-cache's allocator), `harness` (tool-arg validation/repair, adjacent to its
  idempotent-tool exercise), `llm-observability` (OTel span instrumentation), `retrieval-evals` (a grounding
  span-entailment check). Nice-to-haves, not missing concepts.
- **Non-code drills** — `multi-tenant` noisy-neighbor as a *capacity* (availability) exercise; `llm-observability`
  practitioner-drift literature and a worked silent-drift diagnosis.
- **One genuine open problem (⬜)** — `retrieval-evals`: attribution correctness *at scale* with cheap reliable
  labels. This is an active research frontier; it is honestly flagged rather than papered over.

The index is designed to *revert* as the field's frontier expands (Goals §8) — that is the point of a
continuous course. Closing the four second-exercises would take it to ~100%.

## Relationship to learner certification

This index measures **content** coverage (is the material there?). It is distinct from **learner**
certification (has *this* user demonstrated the competency?), tracked per user via mastery bands + spaced
repetition + the runner's analytics view, and from **eval-skill** certification (can the grader reproduce
its own labels? — 44/46 on the pinned Qwen2.5-3B), measured by `npm run eval-gate`. See
[CERTIFICATION.md](CERTIFICATION.md).
