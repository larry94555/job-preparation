# 3. Prompt caching vs. semantic caching tradeoffs — Lesson-Plan Breakdown

**Slug:** `prompt-vs-semantic-caching` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Two different caches. Prompt/prefix caching reuses computed attention state for identical
leading tokens; semantic caching returns a stored response for a similar request.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** prefix (prompt) caching mechanics; semantic caching via embeddings + threshold; hit conditions; correctness risk; TTL/staleness.
- **Key terms:** prefix cache, cache breakpoint, similarity threshold, false-positive hit, TTL, cache key, invalidation.
- **Tradeoffs:** prefill-compute savings (prefix) vs. full-generation savings (semantic); savings vs. correctness/staleness risk.
- **Patterns:** stable-prefix/variable-suffix; layered prefix+semantic; conservative threshold + verification. **Antipatterns:** semantic cache on high-stakes answers; reordering that breaks prefix hits; tenant-blind keys.
- **Architectures:** provider prefix cache; app-side semantic cache; hybrid layered cache.
- **Papers/posts:** GPTCache; provider prompt-caching docs (Anthropic/OpenAI); RAG-cache research. *(verify)*
- **People/canon:** GPTCache authors; provider caching guidance.
- **Benchmarks/metrics:** hit rate, cost/latency saved, false-positive rate, staleness rate.
- **Tools/OSS/models:** GPTCache, Redis/vector stores; provider prefix caching.
- **Open problems:** safe similarity thresholds; invalidation for semantic caches; eval of cache correctness.
- **Interview signals:** can you tell the two caches apart and reason about their risks and savings.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Two caches, two hit conditions | T1 | L2→L3 | C1.1, C1.3, C3.1 | MC, Cloze, FE |
| LP2 | Prefix caching mechanics & prompt structuring | T1 | L3 | C3.3, C6.4 | MC, Code |
| LP3 | Semantic caching: thresholds & false positives | T1 | L3 | C3.3, C5.1 | Essay, Code |
| LP4 | Savings vs. correctness tradeoff | T2 | L3 | C3.3, C6.2 | Essay |
| LP5 | Build a semantic cache (cosine + TTL + guard) | T2 | L3 | C5.2, C5.4 | Code |
| LP6 | Layered caching & multi-tenant safety | T3 | L3 | C3.2, C4.3 | Essay |

**Prereqs:** LP1 gates all; LP6 links to topics 4 (KV/prefix) and 19 (isolation).
