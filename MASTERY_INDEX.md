# Topic Mastery Index — coverage of the Expert Surface

**Snapshot: 2026-07-10.** Regenerate with `npm run mastery` (parses the machine-readable coverage line
in each `topics/<t>/expert-surface.md`). This is the *content* completeness metric of Goals §8/§9: for
each topic we enumerate the capabilities a SOTA expert commands (the **Expert Surface**) and measure how
much of that surface the course covers. Weighted coverage counts ✅ covered = 1, 🟡 partial = 0.5,
⬜ gap = 0.

| Topic | Items | ✅ | 🟡 | ⬜ | Coverage |
|---|---|---|---|---|---|
| cost-attribution | 18 | 18 | 0 | 0 | 100% |
| function-calling-reliability | 21 | 21 | 0 | 0 | 100% |
| kv-cache-management | 21 | 21 | 0 | 0 | 100% |
| adaptation-strategy-selection | 20 | 19 | 1 | 0 | 98% |
| agent-guardrails-budgets | 21 | 20 | 1 | 0 | 98% |
| context-engineering | 21 | 20 | 1 | 0 | 98% |
| eval-methodology | 21 | 20 | 1 | 0 | 98% |
| inference-stack-tradeoffs | 20 | 19 | 1 | 0 | 98% |
| prefill-vs-decode-latency | 20 | 19 | 1 | 0 | 98% |
| production-failure-modes | 21 | 20 | 1 | 0 | 98% |
| prompt-vs-semantic-caching | 21 | 20 | 1 | 0 | 98% |
| quantization-formats-quality | 21 | 20 | 1 | 0 | 98% |
| model-routing-fallback | 18 | 17 | 1 | 0 | 97% |
| rag-architecture | 19 | 18 | 1 | 0 | 97% |
| safety-engineering | 19 | 18 | 1 | 0 | 97% |
| speculative-decoding-quant-distillation | 19 | 18 | 1 | 0 | 97% |
| batching-paged-attention-throughput | 21 | 19 | 2 | 0 | 95% |
| harness-engineering | 20 | 18 | 2 | 0 | 95% |
| multi-tenant-isolation | 21 | 19 | 2 | 0 | 95% |
| structured-output-reliability | 20 | 19 | 0 | 1 | 95% |
| llm-observability | 22 | 18 | 4 | 0 | 91% |
| retrieval-evals | 22 | 19 | 2 | 1 | 91% |
| **All lesson topics** | **447** | **420** | **25** | **2** | **97%** |

`golang-concurrency` is the item-bank pilot (not a full lesson topic) and has no Expert Surface.

## What the gaps are

The index rose **89% → 97%** when WS "polish" added, to every topic, a **Frontier & operations** drill
lesson (closing the D2 frontier-paper-drill and D6 operational-metrics partials) and, for kv-cache, a
sandbox-verified eviction-policy coding exercise. Papers were independently **web-verified** in the same
pass (zero canon corrections needed) and each reading list gained a **"Reception & what aged"** layer.

The residual ~3% is now almost entirely **one bucket**: **D5 hands-on coding exercises** for a concept a
topic already teaches (e.g. a cross-encoder reranker, a chunked-prefill scheduler, an authz-fenced
retrieval, a per-channel quantizer). Each is a sandbox-verified exercise; they are individually small but
must be authored and verified one at a time. Two topics also carry a single ⬜ (a constrained-decoding
*library* exercise in structured-output; a production label-pipeline exercise in retrieval-evals).

Closing the D5 bucket would take the index to ~99–100%. The index is designed to *revert* as the field's
frontier expands (Goals §8) — that is the point of a continuous course.

## Relationship to learner certification

This index measures **content** coverage (is the material there?). It is distinct from **learner**
certification (has *this* user demonstrated the competency?), tracked per user via mastery bands + spaced
repetition + the runner's analytics view, and from **eval-skill** certification (can the grader reproduce
its own labels? — 44/46 on the pinned Qwen2.5-3B), measured by `npm run eval-gate`. See
[CERTIFICATION.md](CERTIFICATION.md).
