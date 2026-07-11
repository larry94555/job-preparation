# 21. Latency, quality, cost, reliability tradeoffs across the full inference stack — Lesson-Plan Breakdown

**Slug:** `inference-stack-tradeoffs` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** The system-level, integrative view: every layer (routing, caching, batching,
quantization, retrieval, decoding) trades among latency, quality, cost, and reliability.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** the four-way tradeoff; per-layer dominant axes; SLOs as anchor; end-to-end budgets; reliability as first-class; second-order interactions.
- **Key terms:** SLO/SLA, latency/cost budget decomposition, Pareto frontier, goodput, tail latency, redundancy cost.
- **Tradeoffs:** the whole point — batching↑throughput/↑latency; quant↓cost/↓quality; fallback↑reliability/↑cost; etc.
- **Patterns:** SLO-anchored design; budget decomposition; measure-then-optimize. **Antipatterns:** single-metric optimization; "free lunch" claims; premature optimization; ignoring reliability cost.
- **Architectures:** end-to-end serving stack; capacity/SLO planning.
- **Papers/posts:** roofline/serving analyses; FrugalGPT; production LLM system write-ups (Anthropic/OpenAI/company blogs). *(verify)*
- **People/canon:** serving-systems researchers; production practitioners; Chip Huyen (systems).
- **Benchmarks/metrics:** TTFT/TPOT, tokens/sec, $/task, availability, p99 latency, quality evals — viewed jointly.
- **Tools/OSS/models:** vLLM/TensorRT-LLM/SGLang; load-testing harnesses; eval + cost + obs stacks combined.
- **Open problems:** joint multi-objective optimization; predictable SLOs under load; interaction effects.
- **Interview signals:** can you reason about a change's effect on all four axes and anchor on SLOs.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | The four-way tradeoff & why no free lunch | T1 | L2→L3 | C1.1, C3.3 | MC, Cloze, FE |
| LP2 | Per-layer levers & their dominant axis | T1 | L3 | C3.1, C3.3 | MC, Essay |
| LP3 | SLOs as the anchor; budget decomposition | T2 | L3 | C3.4, C6.4 | Essay |
| LP4 | Reliability as a first-class axis | T2 | L3 | C3.3, C4.3 | Essay |
| LP5 | Build an SLO-aware config scorer | T2 | L3 | C5.2, C5.4 | Code |
| LP6 | Architect the full stack to SLOs (capstone) | T3 | L3→L4 | C4.4, C5.2 | Essay, Code |

**Prereqs:** integrative — best after topics 4–8, 12, 17. Capstone for the serving cluster.

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
