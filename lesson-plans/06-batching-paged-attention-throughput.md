# 6. Continuous batching, paged attention, throughput optimization — Lesson-Plan Breakdown

**Slug:** `batching-paged-attention-throughput` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** The serving techniques that turn a GPU into a high-throughput multi-request engine:
continuous (in-flight) batching plus paged attention to pack KV memory.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** static/dynamic/continuous batching; iteration-level scheduling; paged attention as substrate; throughput↔latency; fairness/starvation; goodput.
- **Key terms:** continuous/in-flight batching, iteration-level scheduling, head-of-line blocking, paged attention, goodput, GPU utilization.
- **Tradeoffs:** batch size ↑throughput / ↑TPOT; fairness vs. throughput; utilization vs. tail latency.
- **Patterns:** continuous batching + paging; SLO-aware scheduling. **Antipatterns:** static batching under variable output lengths; batch-blind SLOs.
- **Architectures:** Orca-style iteration scheduler; vLLM continuous batching + PagedAttention.
- **Papers/posts:** Orca (Yu 2022); vLLM/PagedAttention (Kwon 2023); FlashAttention (Dao 2022) as kernel context. *(verify)*
- **People/canon:** Orca authors; vLLM team; Tri Dao (FlashAttention).
- **Benchmarks/metrics:** tokens/sec, goodput under SLO, utilization, queue depth, p95 latency.
- **Tools/OSS/models:** vLLM, TGI, TensorRT-LLM, SGLang, LMDeploy.
- **Open problems:** SLO-fair scheduling; multi-tenant isolation of throughput; interference.
- **Interview signals:** can you explain what continuous batching solves over static and its latency cost.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Static → dynamic → continuous batching | T1 | L2→L3 | C1.1, C1.3, C3.1 | MC, Cloze, FE |
| LP2 | Iteration-level scheduling & head-of-line blocking | T1 | L3 | C3.2, C3.3 | MC, Essay |
| LP3 | Paged attention as the enabler | T1 | L3 | C3.1, C1.2 | MC, Essay |
| LP4 | Throughput vs. latency & goodput | T2 | L3 | C6.2, C6.3 | Essay, FE |
| LP5 | Simulate a continuous-batching scheduler | T2 | L3 | C5.1, C5.2 | Code |
| LP6 | SLO-aware & fair scheduling (frontier) | T3 | L3→L4 | C4.4, C2.4 | Essay |

**Prereqs:** topic 4 (paging) and 5 (phases) recommended first.

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
