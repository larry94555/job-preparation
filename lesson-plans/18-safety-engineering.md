# 18. Safety engineering: prompt injection defense, data leakage prevention, permission boundaries — Lesson-Plan Breakdown

**Slug:** `safety-engineering` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Defend LLM systems against prompt injection and data exfiltration, and enforce permission
boundaries so tools and context can't be abused via crafted input.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** direct vs. indirect injection; trust boundaries; defenses (fencing, provenance, allow-list, output filter); data leakage; permission boundaries; confused deputy; defense-in-depth.
- **Key terms:** prompt injection, indirect injection, jailbreak, exfiltration, provenance/trust tag, least privilege, confused deputy, data-flow boundary.
- **Tradeoffs:** capability vs. safety; strict filtering vs. usability; autonomy vs. blast radius.
- **Patterns:** untrusted-content fencing; provenance tagging; least-privilege tools; human confirm on egress. **Antipatterns:** trusting retrieved/tool content; single-filter defense; over-privileged agents.
- **Architectures:** trust-boundary design; dual-LLM / gated egress; policy layers.
- **Papers/posts:** Greshake et al. "indirect prompt injection" (2023); Simon Willison's injection series; OWASP LLM Top 10; dual-LLM pattern. *(verify)*
- **People/canon:** Kai Greshake et al.; Simon Willison; OWASP LLM project.
- **Benchmarks/metrics:** injection catch-rate, exfiltration attempts blocked, false-positive rate; red-team suites.
- **Tools/OSS/models:** guardrails frameworks, injection detectors, policy engines; Rebuff/LLM-Guard.
- **Open problems:** no robust general injection defense; provenance at scale; agent egress control.
- **Interview signals:** direct vs. indirect injection; the confused-deputy risk; why filtering alone fails.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Prompt injection: direct & indirect | T1 | L2→L3 | C1.1, C1.3, C3.2 | MC, Cloze, FE |
| LP2 | Trust boundaries & fencing untrusted content | T1 | L3 | C3.1, C3.3 | MC, Essay |
| LP3 | Data leakage & permission boundaries | T1 | L3 | C3.3, C4.3 | Essay |
| LP4 | The confused deputy in agents | T2 | L3 | C1.2, C4.4 | Essay |
| LP5 | Build a provenance-aware authorization layer | T2 | L3 | C5.2, C5.4 | Code |
| LP6 | Defense-in-depth & red-teaming (frontier) | T3 | L3→L4 | C2.4, C4.4 | Essay |

**Prereqs:** topics 10–11; tightly linked to topic 19.

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
