# 7. Speculative decoding vs. quantization vs. distillation — Lesson-Plan Breakdown

**Slug:** `speculative-decoding-quant-distillation` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Three distinct levers to make inference faster/cheaper. Speculative decoding speeds
latency losslessly; quantization shrinks memory/compute with quality risk; distillation trains a
smaller model.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** draft-and-verify; acceptance rate; lossless output; quantization vs. distillation; composition of levers.
- **Key terms:** draft model, verification, acceptance rate, self-speculation (Medusa/EAGLE), teacher/student, lossless.
- **Tradeoffs:** speculative = latency-only, lossless, needs a good draft; quant = memory/cost, quality risk; distill = permanent smaller model, upfront training.
- **Patterns:** draft+verify; self-speculative heads; stack (distill→quantize→speculate). **Antipatterns:** speculative with poor acceptance; distilling for volatile knowledge; quant to fix latency-bound decode incorrectly.
- **Architectures:** target+draft; Medusa/EAGLE heads; distilled serving models.
- **Papers/posts:** Speculative decoding (Leviathan 2023; Chen 2023); Medusa (Cai 2024); EAGLE; distillation (Hinton 2015). *(verify)*
- **People/canon:** Leviathan/Chen; Medusa/EAGLE authors; Hinton (distillation).
- **Benchmarks/metrics:** acceptance rate, speedup, quality delta (task evals), cost/token.
- **Tools/OSS/models:** vLLM/TensorRT-LLM speculative support; Medusa/EAGLE implementations.
- **Open problems:** high acceptance across domains; combining levers without quality loss.
- **Interview signals:** can you match each lever to the right goal and name which is lossless.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Three levers, three goals | T1 | L2→L3 | C1.1, C1.3, C3.3 | MC, Cloze, FE |
| LP2 | Speculative decoding: draft, verify, acceptance | T1 | L3 | C3.1, C5.1 | MC, Code |
| LP3 | When each is the wrong tool | T2 | L3 | C3.4, C4.3 | Essay |
| LP4 | Simulate acceptance-rate → speedup | T2 | L3 | C5.1, C5.2 | Code |
| LP5 | Composing levers on a real budget (frontier) | T3 | L3→L4 | C4.4, C6.5 | Essay |

**Prereqs:** links to topic 8 (quantization detail) and 5 (decode latency).

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
