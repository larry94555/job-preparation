# 19. Multi-tenant isolation, cache safety, cross-user context contamination prevention — Lesson-Plan Breakdown

**Slug:** `multi-tenant-isolation` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Keep tenants/users separated across caches, context, embeddings, and retrieval — so one
user's data never surfaces in another's session.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** isolation dimensions (cache/index/memory/logs); cache-key safety; cross-user contamination; retrieval scoping/authz; noisy neighbor; isolation testing.
- **Key terms:** tenant scoping, cache-key namespacing, authorization filter, context bleed, cache poisoning, partition, row-level security.
- **Tradeoffs:** sharing (efficiency) vs. isolation (safety); per-tenant indexes vs. filtered shared index.
- **Patterns:** scope in every cache key; authz-filtered retrieval; per-tenant partitions; isolation tests. **Antipatterns:** tenant-blind cache keys; shared semantic cache; unscoped vector search; reused sessions.
- **Architectures:** namespaced caches; per-tenant/pooled vector stores; RLS-backed data.
- **Papers/posts:** semantic-cache leakage discussions; multi-tenant SaaS isolation patterns; provider isolation docs. *(verify)*
- **People/canon:** SaaS multi-tenancy literature; security practitioners.
- **Benchmarks/metrics:** cross-tenant hit/leak rate (target 0), isolation-test pass rate, noisy-neighbor latency variance.
- **Tools/OSS/models:** vector DB namespaces, Postgres RLS, cache key conventions.
- **Open problems:** safe cross-user reuse; provable isolation; embedding-space leakage.
- **Interview signals:** how a semantic cache leaks across tenants; correct retrieval scoping.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Isolation dimensions & the threat | T1 | L2→L3 | C1.1, C1.3, C3.2 | MC, Cloze, FE |
| LP2 | Cache-key safety & poisoning | T1 | L3 | C3.3, C4.3 | MC, Essay |
| LP3 | Retrieval scoping & authorization filters | T1 | L3 | C3.1, C5.1 | MC, Code |
| LP4 | Cross-user context contamination vectors | T2 | L3 | C3.2, C1.2 | Essay |
| LP5 | Build tenant-scoped cache + retrieval filter (+leak test) | T2 | L3 | C5.2, C5.4 | Code |
| LP6 | Proving isolation & adversarial probes (frontier) | T3 | L3→L4 | C4.4, C2.4 | Essay |

**Prereqs:** topics 3 & 18; links to 13.

---

## Lesson flow & sections

Delivered per the standard **present → check → apply → section assessment** loop
([`README.md`](README.md), [`../Goals.md`](../Goals.md) §6.1). The value tiers above map to sections:

- **Section 1 (T1 lessons)** — fundamentals; ends in a section assessment (mastery → light green).
- **Section 2 (T2 lessons)** — practitioner depth; section assessment.
- **Section 3 (T3 lessons)** — expert/frontier; section assessment.
- **Cumulative assessment** — spans the sections once each reaches light green.

Each lesson: present material → formative checks (MC / short-answer / flashcards) → the application
task in its **Modes** column → contributes to its section assessment. Present-before-test is enforced;
the dashboard shows mastery color only (no attempts, no red).
