# Expert Surface — retrieval-evals

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain why retrieval must be scored on its own — an end-to-end miss and a grounding failure look identical from outside — `lessons/metrics.md`, `lessons/grounding.md`, `questions/deep-dive.yaml`.
- ✅ **[L3]** Command the vocabulary: recall@k, precision@k, MRR, nDCG, grounding/faithfulness, attribution, qrels — `lessons/metrics.md`, `lessons/grounding.md`, `questions/missing-term.yaml`, `questions/free-entry.yaml`.
- ✅ **[L2]** Translate a "wrong answer" symptom into the retrieval-vs-grounding decision that localizes it — `lessons/grounding.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** RAGAS (Exploding Gradients, 2023) as the source of RAG-specific metrics (faithfulness, answer relevance, context precision/recall) — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** BEIR (Thakur et al., 2021) and MTEB (Muennighoff et al., 2022) as the retriever/embedding benchmarks; TREC as the classic pooled-qrels relevance methodology — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L4]** Faithful grounding metrics as an open problem (NLI vs. LLM-judge, false-precision risk) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.
- ✅ **[L4]** Aware of attribution-at-scale as an open problem and the current best-effort approaches (LLM-judge + agreement + sampled audits) — drilled in `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five retrieval-eval levers (isolation, labels, metric choice, grounding/attribution judge, gating) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for an eval design (end-to-end-only / vibes / uncalibrated judge / stale set) — `lessons/deep-dive.md`.
- ✅ **[L4]** Review an eval design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Match the metric to the complaint: "buried but present" is MRR/nDCG, not recall@k — `lessons/metrics.md`, `questions/essay.yaml`, `questions/deep-dive.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Compute recall@k, precision@k, and MRR by hand for a ranked list — same numerator, different denominators — `lessons/build-metrics.md`, `questions/build.yaml`, `questions/free-entry.yaml`.
- ✅ **[L3]** Diagnose a wrong answer to a retrieval miss vs. a grounding failure and pick the right fix — `lessons/grounding.md`, `questions/free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement `retrievalMetrics` (recall@k / precision@k / MRR) with Set membership, separate denominators, and a zero-guard — `exercises/retrieval-metrics`, `questions/code.yaml`.
- ✅ **[L4]** Debug a broken recall@k (wrong denominator → recall > 1) with a minimal fix — `exercises/recall-at-k-debug`, `questions/deep-dive.yaml`.
- ✅ **[L4]** Implement a grounding/attribution span-entailment check (per-claim, fabricated-vs-supported) — `exercises/grounding-check`, `questions/frontier-ops.yaml`.
- ✅ **[L3]** Implement graded, position-discounted nDCG (DCG/IDCG with the log2(i+2) discount, sorted-desc ideal, zero-guard) — `exercises/ndcg`, `questions/frontier-ops.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** RAGAS / TruLens / promptfoo and custom harnesses as the eval stacks; wiring evals into a CI regression gate — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- ✅ **[L3]** Operational eval signals (recall@k/nDCG in prod, grounding/faithfulness rate, label-quality audits, eval-set drift) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the eval frontier moves (calibrated judges, synthetic-label validation, attribution at scale) and how to track it — pointers in `lessons/expert-context.md`; curated reading-list module in `reading-list.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags: separate a retrieval miss from a grounding failure, pick the right metric, avoid end-to-end-only/vibes — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a component-isolated eval design (labels, per-stage metrics, calibrated judge, CI gate) under questioning — `questions/deep-dive.yaml` design-review essay, `questions/build.yaml` project essay.

## Coverage summary
22 items · ✅ 22 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
No open gaps: the grounding/attribution span-check coding exercise (`exercises/grounding-check`) and
attribution-correctness-at-scale drills (`questions/frontier-ops.yaml`) both land this pass.

<!-- coverage: items=22 covered=22 partial=0 gap=0 -->
