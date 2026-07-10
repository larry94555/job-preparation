# Expert Surface — production-failure-modes

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain why silent failures (confident, well-formed, wrong, clean 200) are the real danger, not loud errors — `lessons/failure-catalog.md`, `questions/mcq.yaml`, `questions/essay.yaml`.
- ✅ **[L3]** Command the vocabulary: silent vs. loud, validate-repair-fallback, TTL, budget, loop detection, eval gate, canary, error budget, postmortem — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Recite the model-layer failure catalog and distinguish it from generic infra failure — `lessons/failure-catalog.md`, `questions/mcq.yaml`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** Google SRE tradition (postmortems, error budgets) as the reliability lineage this topic borrows — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** OWASP LLM Top 10 as the field checklist of LLM-specific risks — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L4]** End-to-end failure prediction and graceful recovery from multiple simultaneous failures — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml` `[frontier]`.
- ✅ **[L4]** Catching silent regressions *early* as the live open problem beyond CI-eval/canary — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml` `[frontier]`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five reliability levers (detection surface, mitigation policy, containment bounds, prevention gates, rollout safety) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a reliability design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a reliability design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Detection vs. mitigation vs. prevention as three distinct layers, not substitutes — `lessons/handling.md`, `questions/essay.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Pick a failure mode and walk a detect → mitigate → prevent playbook for it — `lessons/handling.md`, `questions/essay.yaml`.
- ✅ **[L3]** Diagnose "error rate near zero, so healthy" reasoning and name what it misses — `lessons/failure-catalog.md`, `questions/deep-dive.yaml`, `questions/mcq.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a bounded `runSafely` guard suite (all-guards-pass, maxAttempts bound, fallback with `ok:false`) — `exercises/run-safely`, `questions/code.yaml`.
- ✅ **[L3]** Compose guards with AND and know why the retry must be bounded and the fallback visible — `lessons/build-run-safely.md`, `questions/build.yaml`.
- ✅ **[L4]** Implement a TTL/freshness guard or a loop-detector as standalone code — `exercises/loop-detector` (`isStuck` no-progress guard), `questions/frontier-ops.yaml` `code-fail-loop-detector`; taught in `lessons/guards.md`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Eval gates, guardrails, and observability + alerting stacks as the operational tooling — `lessons/expert-context.md`, `lessons/guards.md`.
- ✅ **[L3]** Operational signals to instrument (error-budget burn rate, silent-regression lead time, guardrail-trigger rate, MTTD/MTTR) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml` `[ops]`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the reliability frontier moves (silent-regression detection, failure prediction) and how to track it — pointers in `lessons/expert-context.md`; curated reading-list module in `reading-list.md` (WS5).

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags: why silent regressions beat loud errors; loud-error focus / no guardrails / no postmortems as sinkers — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a full reliability design under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
The D2 frontier drill (silent-regression detection, failure prediction, multi-failure recovery) and the
D6 operational-metrics drill land in `lessons/frontier-ops.md` + `questions/frontier-ops.yaml`. The former
D5 gap — a standalone TTL/loop-detector coding exercise — is now closed by `exercises/loop-detector`.

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
