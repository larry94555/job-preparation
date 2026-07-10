# Expert Surface — inference-stack-tradeoffs

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain the four coupled axes (latency, quality, cost, reliability) and why there is no free lunch — `lessons/four-way-tradeoff.md`, `questions/essay.yaml`.
- ✅ **[L3]** Command the vocabulary: SLO, TTFT/TPOT, p99 tail, Pareto frontier, dominant axis — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Translate between altitudes (Pareto-frontier analogy ↔ per-stage latency budget) — `lessons/four-way-tradeoff.md`, `lessons/slos-and-budgets.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** FrugalGPT (Chen et al. 2023) as the cost/quality cascade reference — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** The serving levers reused here (vLLM paged attention, Orca continuous batching, Sarathi chunked prefill) and how they interact — `lessons/deep-dive.md`, `lessons/expert-context.md`.
- ✅ **[L3]** The roofline model as the compute-bound vs. memory-bandwidth-bound diagnostic — `lessons/deep-dive.md`, `lessons/expert-context.md`.
- ✅ **[L4]** Joint multi-objective optimization as an open problem (coupled axes, roofline-guided lever selection, predictable SLOs under load) — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five lever families (batching, memory/KV, phase scheduling, precision, routing/reliability) and their bills — `lessons/deep-dive.md` tradeoff table, `lessons/per-layer-levers.md`.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a stack design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a stack design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L4]** SLO-anchoring: fix SLOs first, then optimize within the feasible region — `lessons/slos-and-budgets.md`, `questions/deep-dive.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Decompose an end-to-end p99 SLO into additive per-stage sub-budgets and find the overrun — `lessons/slos-and-budgets.md`, `questions/essay.yaml`.
- ✅ **[L3]** Given a blown axis, pick the lever whose dominant axis fixes it and name its bill on the other three — `lessons/per-layer-levers.md`, `questions/free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement an SLO-aware config selector (filter on all three SLOs, then rank, return null if none feasible) — `exercises/slo-selector`, `questions/code.yaml`.
- 🟡 **[L4]** Implement a FrugalGPT-style cost/quality cascade / routing policy — taught in `lessons/deep-dive.md`; no dedicated coding exercise.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** vLLM / TensorRT-LLM / SGLang as the serving engines, plus load-testing harnesses — `lessons/expert-context.md`.
- ✅ **[L3]** Combined eval + cost + observability stacks to optimize all four axes together (per-SLO attainment, cost-per-successful-request, headroom/utilization, the triad as a live dashboard) — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the frontier moves (joint multi-objective optimization, predictable SLOs under load, interaction effects) and how to track it — `reading-list.md`, pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags (single-metric optimization, "free lunch," premature optimization, ignoring reliability cost) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend an SLO-anchored stack, reasoning about a change across all four axes — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
20 items · ✅ 19 covered · 🟡 1 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) ≈ **98%**.
The D2 joint-multi-objective-optimization frontier drill and the D6 eval+cost+observability operational
metrics drill now land in `lessons/frontier-ops.md` + `questions/frontier-ops.yaml`. Remaining open
work: a FrugalGPT cascade coding exercise (D5).

<!-- coverage: items=20 covered=19 partial=1 gap=0 -->
