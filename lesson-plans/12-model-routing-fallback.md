# 12. Model routing, graceful fallback logic, degraded-mode UX — Lesson-Plan Breakdown

**Slug:** `model-routing-fallback` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Choose the right model per request and degrade gracefully when a provider is slow, down,
rate-limited, or over budget — without a hard failure for the user.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** routing signals; fallback triggers/direction; degraded-mode UX; circuit breakers; hedged requests; retries/backoff; consistency risk of silent swaps.
- **Key terms:** router, cascade, circuit breaker, hedged request, backoff/jitter, degraded mode, cost cap, quality gate.
- **Tradeoffs:** cost/latency vs. quality; hedging cost vs. tail latency; silent swap vs. transparency.
- **Patterns:** difficulty-based routing; model cascade (cheap→strong); circuit breaker + fallback; honest degraded UX. **Antipatterns:** silent model substitution; no breaker; retry storms.
- **Architectures:** router + fallback chain; LLM-cascade; gateway/proxy (LiteLLM).
- **Papers/posts:** FrugalGPT (Chen 2023); RouteLLM; model-cascade research. *(verify)*
- **People/canon:** FrugalGPT authors; RouteLLM authors.
- **Benchmarks/metrics:** cost/quality frontier, fallback rate, availability/SLA, p99 latency, user-visible error rate.
- **Tools/OSS/models:** LiteLLM, OpenRouter, gateway proxies; mix of local + frontier models.
- **Open problems:** accurate difficulty prediction; quality-preserving routing; consistency under swaps.
- **Interview signals:** can you design a fallback chain with breakers and an honest degraded UX.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Why route & when to fall back | T1 | L2→L3 | C1.1, C3.1 | MC, Cloze, FE |
| LP2 | Routing signals & model cascades | T1 | L3 | C3.3, C6.1 | MC, Essay |
| LP3 | Circuit breakers, hedging, backoff | T1 | L3 | C3.1, C5.1 | MC, Code |
| LP4 | Degraded-mode UX done honestly | T2 | L3 | C1.2, C3.4 | Essay |
| LP5 | Build a router with fallback + breaker | T2 | L3 | C5.2, C5.4 | Code |
| LP6 | Cost/quality frontier & FrugalGPT ideas | T3 | L3→L4 | C2.1, C6.5 | Essay |

**Prereqs:** links to topics 17 (cost) and 21 (tradeoffs).

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
