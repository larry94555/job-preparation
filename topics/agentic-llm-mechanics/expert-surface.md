# Expert Surface — agentic-llm-mechanics

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain the context window as a hard per-call token limit spanning prompt + output — `lessons/context-tokens.md`, `questions/mcq.yaml`.
- ✅ **[L2]** Explain that tokens are the unit of both cost and latency, priced per token with input/output separate — `lessons/context-tokens.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: context window, token budget, tier/routing, cost per run, hallucination, lost-in-the-middle, instruction drift — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** "Lost in the Middle" (Liu et al., 2023): U-shaped retrieval accuracy over position — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Context windows vs. *effective* long-context use as distinct axes — `lessons/expert-context.md`.
- ✅ **[L4]** Frontier of routing: learned routers, model cascades, confidence-based escalation (FrugalGPT) — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** Treat context as a budget the agent must fit under — keep system + recent, drop/summarize the rest — `lessons/context-tokens.md`, `lessons/lost-middle.md`.
- ✅ **[L3]** Route each task to the cheapest capable tier; reserve the best model for compounding-error tasks — `lessons/routing-cost.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Cost per run = Σ(input×price_in + output×price_out); use it to attribute spend and justify routing — `lessons/routing-cost.md`, `lessons/context-tokens.md`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a missed fact in a long prompt as lost-in-the-middle and reposition key info at the edges — `lessons/lost-middle.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Diagnose gradual loss of instruction-following as drift and prescribe periodic re-assertion — `lessons/failure-modes.md`, `questions/mcq.yaml`, `free-entry.yaml`.
- ✅ **[L3]** Diagnose confident-but-wrong output as hallucination and prescribe grounding + validation — `lessons/failure-modes.md`, `questions/mcq.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement a tier router with a safe default (`route_to_model`) — `exercises/model-router`, `questions/code.yaml`.
- ✅ **[L3]** Implement per-call cost estimation with separate in/out pricing (`estimate_cost`) — `exercises/cost-estimator`, `questions/code.yaml`.
- ✅ **[L3]** Implement budget-aware context trimming keeping system + recent (`fit_messages`) — `exercises/context-budget`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Tokenizers + provider pricing pages + tier/model selection as the practical cost stack — `lessons/context-tokens.md`, `lessons/routing-cost.md`, `reading-list.md`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the routing/long-context frontier moves (learned routers, cascades, effective-context evals) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Defend a routing decision and a failure-mode mitigation plan under questioning — `questions/essay.yaml` (`essay-routing`, `essay-failure-modes`).

## Coverage summary
18 items · ✅ 18 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (effective-context benchmarks, trained routers, per-tier reliability evals).

<!-- coverage: items=18 covered=18 partial=0 gap=0 -->
