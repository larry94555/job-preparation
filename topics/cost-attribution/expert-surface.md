# Expert Surface — cost-attribution

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain why per-model cost is the wrong granularity and name the dimensions you can act on — `lessons/drivers.md`, `questions/essay.yaml`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: attribution tag, tag propagation, unattributed bucket, cost-per-successful-task — `lessons/attribution.md`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Translate between altitudes (a billed token ↔ a business dimension it rolls up to) — `lessons/attribution.md`, `lessons/drivers.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** FrugalGPT (Chen et al. 2023) as the LLM-cascade cost paper — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** FinOps-for-LLM practice: tag, attribute, optimize continuously rather than read one invoice — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- 🟡 **[L4]** Predicting per-feature cost before ship and cost-per-successful-outcome vs. per-token unit economics — named as open problems in `lessons/expert-context.md`; no dedicated drill.
- ⬜ **[L4]** Fair per-tenant/per-feature attribution at scale (shared/cached/async allocation policy) — named as the hard open problem in `lessons/deep-dive.md`; no exercise or policy drill.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five cost-attribution levers (granularity, tag propagation, unit metric, cost lens, shared-cost handling) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a cost-attribution design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a cost-attribution design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Blended vs. marginal cost as the ship/no-ship lens for a new feature — `lessons/economics.md`, `questions/deep-dive.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Compute cost-per-successful-task from labeled records and reason about hidden costs (retries, abandonment, over-retrieval) — `lessons/economics.md`, `lessons/build-cost-aggregator.md`, `questions/free-entry.yaml`.
- ✅ **[L3]** Diagnose an unattributed-spend bucket to a broken tag propagation through async/retries — `lessons/attribution.md`, `questions/deep-dive.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a cost aggregator (group-by feature, sum cost, cost-per-success with zero-success guard) — `exercises/cost-aggregator`, `questions/code.yaml`.
- ✅ **[L4]** Debug a broken cost-per-success metric (denominator = successes, not all attempts) — `exercises/cost-per-success-debug`, `questions/build.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Helicone / LiteLLM / Langfuse as the per-request cost-tracking stacks, plus custom aggregators — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- 🟡 **[L3]** Operational coverage signals (unattributed spend %, tenant-blind cache, untagged async jobs) — discussed in `lessons/deep-dive.md`; not drilled as metrics.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the cost frontier moves (predictive per-feature cost, fair shared-cost allocation) and how to track it — `reading-list.md`, plus pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags on cost attribution (per-model-only, ignoring failed runs, over-retrieval) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a cost-attribution design under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
18 items · ✅ 15 covered · 🟡 2 partial · ⬜ 1 gap. Weighted coverage (covered=1, partial=0.5) ≈ **89%**.
Open frontier work: a predictive per-feature-cost / cost-per-successful-outcome drill, a fair
shared-cost allocation exercise for per-tenant/per-feature attribution at scale, and an operational
coverage-metrics drill.

<!-- coverage: items=18 covered=15 partial=2 gap=1 -->
