# 15. Evals: golden sets, regression tests, adversarial tests, LLM-as-judge, human evals — Lesson-Plan Breakdown

**Slug:** `eval-methodology` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** The discipline of measuring LLM system quality: golden sets, regression gates, adversarial
coverage, judge models, human review — and each one's failure modes.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** golden sets; regression/CI gates; adversarial tests; LLM-as-judge (+biases, calibration); human evals; metric selection; overfitting-to-eval.
- **Key terms:** golden set, regression gate, adversarial/red-team, LLM-as-judge, pairwise/rubric grading, position/verbosity/self bias, inter-rater agreement.
- **Tradeoffs:** automation cost vs. fidelity; judge cheapness vs. bias; coverage vs. maintenance.
- **Patterns:** curated golden + CI threshold; rubric decomposition; judge calibrated to humans; canary/adversarial suites. **Antipatterns:** vibes-only; teaching to the test; uncalibrated judge; static stale sets.
- **Architectures:** offline eval harness + CI gate; online eval sampling; this project's **meta-eval gate**.
- **Papers/posts:** MT-Bench / LLM-as-judge (Zheng 2023); "judging judges"/bias studies; HELM (Liang 2022). *(verify)*
- **People/canon:** Zheng et al.; Percy Liang (HELM); eval practitioners (Hamel Husain, Eugene Yan).
- **Benchmarks/metrics:** pass-rate, agreement with humans (κ), regression deltas, adversarial catch-rate.
- **Tools/OSS/models:** promptfoo, OpenAI Evals, LangSmith, Braintrust, Inspect.
- **Open problems:** trustworthy cheap judges; contamination; construct validity of benchmarks.
- **Interview signals:** when LLM-as-judge is appropriate, its biases, and how you gate regressions.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Why evals are the core discipline | T1 | L2→L3 | C1.1, C1.3 | MC, Cloze, FE |
| LP2 | Golden sets & regression gates | T1 | L3 | C3.1, C6.2 | MC, Essay |
| LP3 | Adversarial & edge-case tests | T1 | L3 | C3.2, C4.3 | MC, Essay |
| LP4 | LLM-as-judge: rubrics, biases, calibration | T1 | L3 | C2.1, C3.3 | Essay |
| LP5 | Human evals & agreement | T2 | L3 | C6.2, C6.3 | Essay |
| LP6 | Build an eval harness with a CI gate | T2 | L3 | C5.2, C5.4 | Code |
| LP7 | Avoiding overfit & benchmark validity (frontier) | T3 | L3→L4 | C2.4, C4.4 | Essay |

**Prereqs:** LP1 gates; mirrors this repo's meta-eval gate (`DESIGN.md` §7); links to 14, 16, 22.

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
