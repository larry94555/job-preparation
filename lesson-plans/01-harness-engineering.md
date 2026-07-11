# 1. Harness engineering, not just prompt engineering — Lesson-Plan Breakdown

**Slug:** `harness-engineering` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Reliability lives in the code around the model — tools, state, retries, verification,
permissions, control flow — not in the prompt string.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** model/harness boundary; think→act→observe loop; tool registry & execution; read/write
  tool separation; permission gates; plan-then-execute; verification (tests/diff); idempotency; sessions/state; streaming; interrupts.
- **Key terms:** harness, agent loop, tool contract, permission mode, plan mode, duplicate-call guard, deadline, verifier/critic.
- **Tradeoffs:** autonomy vs. control; more-prompting vs. more-harness; verification cost vs. safety.
- **Patterns:** think-act-observe; plan-then-execute; verifier/critic; read-before-write. **Antipatterns:** trusting unverified output; unbounded loops; prompt-only reliability; god-prompt.
- **Architectures:** single-loop agent → plan-execute orchestrator → constrained multi-agent delegation.
- **Papers/posts:** ReAct (Yao 2022); Reflexion (Shinn 2023); Toolformer (Schick 2023); Anthropic "Building effective agents" (2024). *(verify)*
- **People/canon:** Yao (ReAct); Anthropic agents guidance; Chip Huyen; Simon Willison.
- **Benchmarks/metrics:** task success rate, steps-to-complete, tool-call validity rate, SWE-bench (agentic).
- **Tools/OSS/models:** Claude Agent SDK, OpenAI Agents SDK, LangChain/LlamaIndex, smolagents; AutoGPT (cautionary); local study harness `imini`.
- **Open problems:** reliable long-horizon autonomy; verifying open-ended tasks; robust error recovery.
- **Interview signals:** can you split model vs. harness responsibilities; how you bound and verify an agent.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | The model/harness boundary | T1 | L2→L3 | C1.1, C1.3, C3.1 | MC, Cloze, FE |
| LP2 | The agent loop: think→act→observe | T1 | L2→L3 | C3.1, C5.1 | MC, Code |
| LP3 | Verification & edit trust (don't trust, check) | T1 | L3 | C3.3, C5.4 | Essay, Code |
| LP4 | Tool contracts & read/write separation | T2 | L3 | C3.2, C5.3 | MC, Code |
| LP5 | Loop control: budgets, guards, interrupts | T2 | L3 | C3.3, C5.2 | Code, Essay |
| LP6 | Plan-then-execute orchestration | T2 | L3 | C3.1, C3.4 | Essay |
| LP7 | Multi-agent delegation — and when not to | T3 | L3→L4 | C3.3, C4.4 | Essay |
| LP8 | Interview craft: talking harness design | T1✶ | L3 | C1.2, C8.3 | Essay |

✶ cross-cutting career slice. **Prereqs:** LP1 gates all; LP4–5 feed topics 10–11.

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
