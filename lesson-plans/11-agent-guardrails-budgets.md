# 11. Agent guardrails, loop budgets, tool budgets, termination conditions — Lesson-Plan Breakdown

**Slug:** `agent-guardrails-budgets` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Keep autonomous agents bounded and safe: step/tool/token budgets, explicit termination,
and guardrails against runaway loops and unsafe actions.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** termination conditions; budgets (steps/tools/tokens/cost/wall-clock); progress/loop detection; guardrails; graceful termination; human-in-the-loop.
- **Key terms:** loop budget, tool budget, termination condition, no-progress/oscillation, circuit breaker, HITL escalation, allow-list.
- **Tradeoffs:** autonomy vs. safety/cost; hard stop vs. partial result; strict vs. permissive guardrails.
- **Patterns:** budget caps; repeated-state detection; confirm high-risk actions; partial-result return. **Antipatterns:** open-ended loops; no cost ceiling; success-only exit conditions.
- **Architectures:** bounded agent runner; supervisor/critic; HITL gates.
- **Papers/posts:** ReAct/Reflexion; Anthropic "Building effective agents"; guardrails frameworks (NeMo Guardrails, Guardrails AI). *(verify)*
- **People/canon:** Anthropic agents guidance; guardrails-framework authors.
- **Benchmarks/metrics:** completion rate, steps/cost per task, runaway/timeout rate, intervention rate.
- **Tools/OSS/models:** Guardrails AI, NeMo Guardrails, agent SDK budget features.
- **Open problems:** detecting "stuck" reliably; safe long-horizon autonomy; principled budgets.
- **Interview signals:** can you enumerate termination conditions and why budgets matter for correct agents.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Why agents need budgets & termination | T1 | L2→L3 | C1.1, C1.3 | MC, Cloze, FE |
| LP2 | Termination conditions & progress detection | T1 | L3 | C3.1, C3.2 | MC, Essay |
| LP3 | Budgets: steps, tools, tokens, cost, time | T1 | L3 | C3.3, C6.4 | MC, Code |
| LP4 | Guardrails for high-risk actions | T2 | L3 | C3.3, C4.3 | Essay |
| LP5 | Build a bounded agent runner | T2 | L3 | C5.2, C5.4 | Code |
| LP6 | HITL escalation & graceful degradation | T3 | L3 | C3.4, C4.4 | Essay |

**Prereqs:** topics 1 & 10; links to topics 12, 18, 22.

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
