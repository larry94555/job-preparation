# 20. Fine-tuning vs. in-context learning vs. RAG vs. distillation — Lesson-Plan Breakdown

**Slug:** `adaptation-strategy-selection` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Choose how to adapt a model to a task/domain. Each approach fits different problems; the
skill is recognizing when a popular choice is the wrong one.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** in-context learning; RAG (knowledge/attribution); fine-tuning (behavior/format/latency); distillation (cheaper deploy); decision axes; anti-patterns.
- **Key terms:** ICL/few-shot, SFT, LoRA/PEFT, RAG, distillation, knowledge freshness, behavior change, attribution.
- **Tradeoffs:** freshness (RAG) vs. behavior (FT); training cost vs. inference cost; ICL simplicity vs. context limits.
- **Patterns:** RAG for volatile facts; FT for format/style/latency; distill known-good behavior; combine (RAG+FT). **Antipatterns:** FT for changing facts; RAG to fix formatting; over-adapting; premature FT.
- **Architectures:** RAG stack; PEFT/LoRA training; distillation pipeline; hybrid.
- **Papers/posts:** RAG (Lewis 2020); LoRA (Hu 2021); distillation (Hinton 2015); "RAG vs. FT" comparative studies. *(verify)*
- **People/canon:** Lewis; Edward Hu (LoRA); Hinton; practitioner decision guides.
- **Benchmarks/metrics:** task quality, freshness/staleness, $/query, training cost, latency.
- **Tools/OSS/models:** PEFT/LoRA libs, RAG frameworks, distillation tooling; open vs. frontier models.
- **Open problems:** principled selection; combining methods; continual/online adaptation.
- **Interview signals:** naming the *wrong* tool for a scenario and defending a combination.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Four approaches at a glance | T1 | L2→L3 | C1.1, C1.3 | MC, Cloze, FE |
| LP2 | Decision axes: freshness, behavior, cost, latency | T1 | L3 | C3.3, C3.4 | MC, Essay |
| LP3 | When each is the WRONG tool | T1 | L3 | C3.2, C4.3 | Essay |
| LP4 | ICL & RAG vs. fine-tuning in practice | T2 | L3 | C6.1, C2.1 | Essay |
| LP5 | Build a `chooseStrategy()` decision function | T2 | L3 | C5.1, C5.2 | Code |
| LP6 | Combining methods & continual adaptation (frontier) | T3 | L3→L4 | C2.4, C4.4 | Essay |

**Prereqs:** benefits from topics 7, 13; integrative with topic 21.

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
