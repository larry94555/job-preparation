# Expert Surface — multi-tenant-isolation

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain that the leak comes from shared state around the model, not the weights — `lessons/dimensions.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: tenant scope, namespace, RLS, pre/post-filter, semantic-cache leakage, cache poisoning — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Frame the core efficiency (sharing) vs. safety (isolation) tradeoff — `lessons/dimensions.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** This is a SaaS/security tradition with no single seminal LLM paper — say so aloud — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** Row-level security (RLS) as the engine-enforced tenant predicate — `lessons/expert-context.md`, `lessons/deep-dive.md`, `questions/expert.yaml`.
- ✅ **[L3]** Semantic-cache cross-tenant leakage as the modern LLM twist on an old problem — `lessons/cache-safety.md`, `lessons/expert-context.md`.
- ✅ **[L4]** Embedding-space leakage as a similarity side channel (open problem), OWASP LLM08 vector/embedding weaknesses, and semantic-cache cross-tenant leakage as the frontier — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five isolation levers (partitioning, boundary enforcement, retrieval scoping, cache keying, session/state scope) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for an isolation design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review an isolation design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay), `questions/essay.yaml`.
- ✅ **[L3]** Pre-filter vs. post-filter retrieval scoping and why post-filtering is unsafe — `lessons/retrieval-scoping.md`, `questions/deep-dive.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a cross-tenant leak to its surface (cache key, unscoped index, reused session, pooled logs) — `lessons/dimensions.md`, `lessons/retrieval-scoping.md`.
- ✅ **[L4]** Enforce per-tenant quota admission so a noisy neighbor can't starve others (availability, not confidentiality) — `exercises/tenant-quota`, `questions/frontier-ops.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a tenant-scoped cache where identical keys across tenants never collide (cross-tenant miss) — `exercises/tenant-cache`, `questions/code.yaml`.
- ✅ **[L4]** Debug a tenant-blind cache-key leak back to a scoped key — `exercises/tenant-cache-debug`, `questions/deep-dive.yaml`.
- ✅ **[L4]** Implement an authz-filtered (pre-filtered) retrieval scope — `exercises/scoped-retrieve`, `questions/frontier-ops.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** vector-DB namespaces, Postgres RLS, and cache-key conventions as the tooling — `lessons/expert-context.md`, `lessons/build-tenant-cache.md`.
- ✅ **[L3]** Operational signals (cross-tenant leak-test pass rate, per-tenant quota/rate-limit hits, cache-key-scope audits, noisy-neighbor latency variance) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the isolation frontier moves (safe cross-user reuse, provable isolation, embedding-space leakage) and how to track it — `reading-list.md`, plus pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags (tenant-blind keys, shared semantic cache, unscoped search, reused sessions) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a tenant-isolation design under questioning (scoped keys → authz-filtered retrieval → RLS) — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
No remaining partial or gap work.

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
