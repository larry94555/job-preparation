# 17. Cost attribution per feature, workflow, tenant, user journey — Lesson-Plan Breakdown

**Slug:** `cost-attribution` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Attribute LLM spend to the dimensions the business cares about — feature, workflow,
tenant, user journey — not just per model, so cost can be optimized where it accrues.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** cost drivers (in/out tokens, tier, retries, tools, caching); attribution dimensions; tag propagation; unit economics; hidden costs; budgets/quotas/cost-routing.
- **Key terms:** cost per successful task, attribution tag, unit economics, blended vs. marginal cost, token accounting, budget/quota.
- **Tradeoffs:** granularity vs. overhead; caching savings vs. correctness; quality tier vs. cost.
- **Patterns:** tag propagation through pipelines; cost-per-success; per-tenant rollups; cost-based routing. **Antipatterns:** cost-per-model only; ignoring failed/abandoned runs; over-retrieval/oversized context.
- **Architectures:** tagged call records → aggregation → dashboards; cost gateway.
- **Papers/posts:** FrugalGPT (Chen 2023); FinOps-for-LLM writing; provider pricing analyses. *(verify)*
- **People/canon:** FrugalGPT authors; FinOps/LLM-cost practitioners.
- **Benchmarks/metrics:** $/task, $/tenant, $/journey, margin, retry-cost share, cache-savings.
- **Tools/OSS/models:** Helicone, LiteLLM cost tracking, Langfuse cost; custom aggregators.
- **Open problems:** attributing shared/cached/async cost; predicting per-feature cost; fair tenant billing.
- **Interview signals:** why per-model cost is the wrong granularity; how you'd attribute across features/tenants.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Cost drivers & why per-model is wrong | T1 | L2→L3 | C1.1, C6.2 | MC, Cloze, FE |
| LP2 | Attribution dimensions & tag propagation | T1 | L3 | C3.1, C3.3 | MC, Essay |
| LP3 | Unit economics: cost per successful task | T1 | L3 | C6.2, C4.2 | FE, Essay |
| LP4 | Hidden costs: retries, abandonment, over-retrieval | T2 | L3 | C3.2, C6.5 | Essay |
| LP5 | Build a tagged cost aggregator | T2 | L3 | C5.2, C5.4 | Code |
| LP6 | Budgets, quotas & cost-based routing | T3 | L3 | C3.4, C6.5 | Essay |

**Prereqs:** links to topics 12 (routing), 16 (observability), 21 (tradeoffs).

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
