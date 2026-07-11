# 5. Prefill vs. decode latency — Lesson-Plan Breakdown

**Slug:** `prefill-vs-decode-latency` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Inference has two phases with opposite profiles: prefill (compute-bound, parallel over
prompt tokens, sets TTFT) and decode (memory-bandwidth-bound, sequential, sets TPOT).

## Expert Surface (light — living; verify before authoring)
- **Concepts:** prefill vs. decode; compute-bound vs. memory-bandwidth-bound; TTFT vs. TPOT; chunked prefill; prefill/decode disaggregation; arithmetic intensity/roofline.
- **Key terms:** TTFT, TPOT/ITL, prefill, decode, chunked prefill, disaggregation, roofline, memory-bandwidth bound.
- **Tradeoffs:** batch helps decode throughput but saturates prefill; prompt length ↑TTFT; output length ↑total via TPOT.
- **Patterns:** chunked prefill; P/D disaggregation; separate SLOs for TTFT and TPOT. **Antipatterns:** single latency number; optimizing decode to fix a prefill-bound workload.
- **Architectures:** unified engine; disaggregated prefill/decode clusters.
- **Papers/posts:** Sarathi / chunked prefill; DistServe / Splitwise (disaggregation); roofline analyses. *(verify)*
- **People/canon:** Sarathi/DistServe/Splitwise authors.
- **Benchmarks/metrics:** TTFT, TPOT/ITL, tokens/sec, p50/p95 latency by phase.
- **Tools/OSS/models:** vLLM, TensorRT-LLM, benchmarking harnesses (e.g. GenAI-Perf).
- **Open problems:** SLO-optimal P/D scheduling; interference between phases.
- **Interview signals:** can you say which phase a change affects and why the two optimize differently.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Two phases, two bottlenecks | T1 | L2→L3 | C1.1, C1.3 | MC, Cloze, FE |
| LP2 | TTFT vs. TPOT: mapping metrics to phases | T1 | L3 | C6.2, C3.3 | MC, FE |
| LP3 | Why batching helps decode but not prefill | T1 | L3 | C3.3, C1.2 | Essay |
| LP4 | Build a phase-aware latency model | T2 | L3 | C5.1, C5.2 | Code |
| LP5 | Chunked prefill & P/D disaggregation | T3 | L3→L4 | C3.1, C2.4 | Essay |

**Prereqs:** LP1 gates; tightly linked to topics 4 and 6.

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
