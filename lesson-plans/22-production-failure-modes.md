# 22. Production failure modes — Lesson-Plan Breakdown

**Slug:** `production-failure-modes` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Capstone catalog of how LLM systems fail in production — hallucinated tool calls,
malformed JSON, stale retrieval, runaway agents, silent eval regressions — with detection and
mitigation for each. Synthesizes topics 9, 10, 11, 13, 15, 16.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** per-failure detection vs. mitigation vs. prevention; the danger of *silent* failures; incident response/postmortems; failure playbooks.
- **Key terms:** hallucinated tool call, malformed output, stale retrieval, runaway agent, silent regression, canary, guardrail, blast radius, postmortem.
- **Tradeoffs:** detection sensitivity vs. noise; mitigation cost vs. risk; prevention effort vs. likelihood.
- **Patterns:** validate-repair-fallback; freshness/TTL checks; budgets + loop detection; CI eval gates + canaries; runbooks. **Antipatterns:** loud-error focus while ignoring silent regressions; no guardrails; no postmortems.
- **Architectures:** `runSafely` wrapper composing guards; layered defenses; incident tooling.
- **Papers/posts:** SRE/postmortem practice; OWASP LLM Top 10; company incident write-ups; eval-gate practices. *(verify)*
- **People/canon:** SRE tradition (Google SRE book); LLM-ops practitioners.
- **Benchmarks/metrics:** failure catch-rate, MTTR, silent-regression detection lead time, guardrail firing rate.
- **Tools/OSS/models:** eval gates, guardrails, observability + alerting stacks (see topics 15–16).
- **Open problems:** catching silent regressions early; end-to-end failure prediction; graceful multi-failure recovery.
- **Interview signals:** why silent regressions are worse than loud errors; a detect→mitigate→prevent playbook.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | The failure catalog & the silent-failure danger | T1 | L2→L3 | C1.1, C3.2 | MC, Cloze, FE |
| LP2 | Detection vs. mitigation vs. prevention | T1 | L3 | C3.3, C1.2 | MC, Essay |
| LP3 | Hallucinated tools & malformed JSON | T1 | L3 | C3.2, C5.4 | MC, Code |
| LP4 | Stale retrieval & runaway agents | T2 | L3 | C3.2, C4.3 | Essay, Code |
| LP5 | Silent eval regressions & canaries | T2 | L3 | C3.3, C6.2 | Essay |
| LP6 | Build a `runSafely` guard suite (capstone) | T2 | L3 | C5.2, C5.5 | Code |
| LP7 | Incident response & postmortems (frontier) | T3 | L3→L4 | C4.4, C8.4 | Essay |

**Prereqs:** capstone — author after topics 9, 10, 11, 13, 15, 16.
