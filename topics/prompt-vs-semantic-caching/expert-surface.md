# Expert Surface — prompt-vs-semantic-caching

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Tell the two caches apart: prefix reuses prefill on identical leading tokens, semantic returns a stored response on embedding similarity — `lessons/two-caches.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: prefix/prompt cache, prefill, embedding similarity, threshold, false-positive hit, TTL/staleness — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Explain what each cache saves (prefill compute vs. full generation) and why the bigger saving carries the bigger risk — `lessons/two-caches.md`, `questions/essay.yaml`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** GPTCache (Zilliz, 2023) as the semantic-caching origin, backed by Redis / vector stores — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Provider prompt/prefix caching (Anthropic, OpenAI) as the exact-leading-token cache — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L4]** Cache-correctness evaluation as a measured quantity (how often a "hit" was actually right; gate threshold changes behind it) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.
- ✅ **[L4]** Semantic-cache invalidation research beyond TTL (embedding drift, content changed under a still-similar query, provider prefix-cache lifetimes) — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The caching levers (which cache, prompt structure, threshold, keys/scope, invalidation/TTL, verification) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a caching design (baseline prefix → layered → semantic-on-high-stakes) — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a caching design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Layered caching: exact-prefix cache in front of an embedding-similarity semantic cache with safety guards — `lessons/deep-dive.md`, `questions/build.yaml` `essay-layered-caching`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a near-zero prefix hit rate to per-request variability at the top and restructure the prompt (stable prefix, variable suffix) — `lessons/prefix-mechanics.md`, `questions/deep-dive.yaml`.
- ✅ **[L3]** Reason about the similarity-threshold operating point (savings vs. false positives) and pick it with an eval, not a guess — `lessons/semantic-thresholds.md`, `questions/essay.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a semantic cache: cosine similarity, threshold gate on the best non-expired entry, TTL expiry as a miss — `exercises/semantic-cache`, `questions/code.yaml`.
- ✅ **[L4]** Debug a broken semantic-cache hit test (unrelated answers served, near-duplicates missed) — `exercises/semantic-cache-debug`, `questions/deep-dive.yaml`.
- 🟡 **[L4]** Implement a layered prefix→semantic path or a verification-gated hit — discussed in `lessons/deep-dive.md`; no dedicated coding exercise (single-cache exercises only).

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** GPTCache + Redis / vector stores for the semantic layer; provider prefix caching for the exact layer — `lessons/expert-context.md`.
- ✅ **[L3]** Operational signals for a cache layer (hit rate by type, false-hit/incorrect-serve rate, staleness/TTL-miss rate, net cost/latency saved) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the caching frontier moves (measured cache correctness, semantic invalidation) and how to track it — `reading-list.md`, with pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags on caching (semantic-on-high-stakes, prompt reordering, tenant-blind keys) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a layered caching design under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
21 items · ✅ 20 covered · 🟡 1 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) ≈ **98%**.
The frontier & operations drill (`lessons/frontier-ops.md`, `questions/frontier-ops.yaml`) closed the
cache-correctness eval, semantic-invalidation-beyond-TTL, and cache-metrics operational items. The one
remaining partial is a dedicated layered/verification-gated coding exercise (single-cache exercises only).

<!-- coverage: items=21 covered=20 partial=1 gap=0 -->
