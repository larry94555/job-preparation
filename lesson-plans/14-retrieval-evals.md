# 14. Retrieval evals: recall, precision, grounding, attribution, citation quality — Lesson-Plan Breakdown

**Slug:** `retrieval-evals` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Measure whether retrieval helps: right context fetched (recall/precision), answer uses it
(grounding), citations correct (attribution).

## Expert Surface (light — living; verify before authoring)
- **Concepts:** retrieval metrics; grounding/faithfulness; attribution/citation quality; labeled sets; isolating retrieval vs. generation failures; online vs. offline.
- **Key terms:** recall@k, precision@k, MRR, nDCG, faithfulness, groundedness, attribution, hallucinated citation, relevance judgment.
- **Tradeoffs:** recall vs. precision; label cost vs. fidelity; automated vs. human judgment.
- **Patterns:** component-isolated evals; judge-based grounding; citation-span checks. **Antipatterns:** end-to-end-only evals; conflating retrieval and generation errors; unlabeled "vibes."
- **Architectures:** offline eval harness; online guardrail evals; RAG eval frameworks.
- **Papers/posts:** RAGAS (Es 2023); ARES; TREC relevance methodology; BEIR/MTEB. *(verify)*
- **People/canon:** RAGAS/ARES authors; IR eval tradition (TREC).
- **Benchmarks/metrics:** recall@k/precision@k/MRR/nDCG; faithfulness, answer-relevance, context-precision/recall.
- **Tools/OSS/models:** RAGAS, TruLens, promptfoo, custom harnesses.
- **Open problems:** faithful grounding metrics; cheap reliable labels; attribution correctness at scale.
- **Interview signals:** can you separate a retrieval miss from a grounding failure and pick the right metric.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Retrieval metrics: recall@k, precision@k, MRR | T1 | L2→L3 | C1.3, C6.2 | MC, Cloze, FE |
| LP2 | Grounding vs. retrieval failures | T1 | L3 | C3.2, C1.2 | MC, Essay |
| LP3 | Attribution & citation quality | T1 | L3 | C3.3, C4.2 | MC, Essay |
| LP4 | Implement recall@k / precision@k / MRR | T2 | L3 | C5.1, C5.2 | Code |
| LP5 | Building labeled retrieval sets | T2 | L3 | C6.2, C6.3 | Essay |
| LP6 | Component-isolated eval design (frontier) | T3 | L3→L4 | C2.4, C4.4 | Essay |

**Prereqs:** topic 13; feeds topic 15 (eval methodology) & 22 (failure modes).
