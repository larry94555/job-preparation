# Expert Surface — agent-guardrails-budgets

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain why an agent loop has no natural stopping point and needs budgets + termination baked in — `lessons/termination.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: budget, termination condition, no-progress/oscillation, allow-list, HITL, circuit breaker — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Distinguish budgets (*how much*) from termination (*when it stops*) from guardrails (*what is allowed*) — `lessons/guardrails.md`, `lessons/deep-dive.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** ReAct (reason-then-act loop) and Reflexion (self-reflection/retry) as the loops budgets must bound — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Anthropic "Building Effective Agents" as the practitioner guidance for bounded, verified autonomy — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- ✅ **[L4]** NeMo Guardrails / Guardrails AI as the named enforcement frameworks — rails/validators as reviewable, versionable policy vs. incidental code — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.
- ✅ **[L4]** Principled/proof-backed budget & termination guarantees beyond heuristics (formal termination bounds, generalizing no-progress detection, long-horizon containment) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five levers (budget dimensions, termination conditions, no-progress detection, action gating, failure containment) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a guardrails-and-budgets design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a runner design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Budget dimensions are not interchangeable: wall-clock, per-tool, and cost each bound a distinct failure mode — `lessons/budgets.md`, `questions/deep-dive.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Enumerate the full set of termination conditions (success, failure/no-progress, every budget exhaustion) for a runner — `lessons/termination.md`, `questions/free-entry.yaml`.
- ✅ **[L3]** Diagnose a runaway/overspend to a missing budget axis and choose the right guard (wall-clock, per-tool, cost, no-progress) — `lessons/deep-dive.md`, `questions/deep-dive.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a bounded agent loop with three stop conditions and correctly ordered checks (complete → no-progress → budget), returning the reason — `exercises/bounded-loop`, `questions/code.yaml`.
- ✅ **[L4]** Debug a bounded-run bug (dropped stop condition / wrong check order draining budget) — `exercises/bounded-run-debug`, `questions/deep-dive.yaml`.
- 🟡 **[L4]** Implement HITL confirmation / circuit-breaker gating on high-risk actions in code — taught in `lessons/guardrails.md`; no dedicated coding exercise.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Allow-list (deny-by-default) vs deny-list and gating high-risk actions by blast radius — `lessons/guardrails.md`, `questions/deep-dive.yaml`.
- ✅ **[L3]** Graceful degradation: return best partial result + inspectable state on exhaustion rather than crash — drilled as an operational signal (steps-per-task distribution, budget-exhaustion rate, loop/stuck-detection triggers, graceful-degradation rate) in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the guardrails frontier moves (reliable "stuck" detection, safe long-horizon autonomy, principled budgets) and how to track it — pointers in `lessons/expert-context.md`; curated reading-list module in `reading-list.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags (open-ended loops, no cost ceiling, success-only exits) on agent bounding — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a bounded-and-guarded agent-runner design under questioning — `questions/deep-dive.yaml` design-review essay, `questions/essay.yaml`.

## Coverage summary
21 items · ✅ 20 covered · 🟡 1 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) ≈ **98%**.
Remaining open work: a HITL-confirmation / circuit-breaker **coding** exercise (D5); the framework,
principled-termination, and graceful-degradation gaps are now drilled in `lessons/frontier-ops.md` and
`questions/frontier-ops.yaml`.

<!-- coverage: items=21 covered=20 partial=1 gap=0 -->
