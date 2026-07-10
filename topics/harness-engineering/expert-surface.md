# Expert Surface — harness-engineering

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain the model/harness boundary: the model reasons, the harness owns tools, state, retries, verification, termination — `lessons/harness-boundary.md`, `questions/mcq.yaml`, `questions/essay.yaml`.
- ✅ **[L3]** Command the vocabulary: agent loop, think→act→observe, budget, duplicate-call guard, idempotency, no-progress detection — `lessons/harness-loop.md`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L3]** State the core thesis — "reliability lives in the harness, not the prompt" — and defend it — `lessons/harness-boundary.md`, `questions/essay.yaml`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** ReAct (Yao et al. 2022) as the reason-then-act loop that most harnesses harden — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** Reflexion (Shinn et al. 2023) for self-reflection/retry and Toolformer (Schick et al. 2023) for learned tool use — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Anthropic "Building Effective Agents" (2024) as the simplicity/composability touchstone — `lessons/expert-context.md`.
- ✅ **[L4]** SWE-bench-style agentic coding harnesses as a benchmark frontier — long-horizon verifiable work where verification (tests/diff) decides success — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five harness levers (boundary placement, loop control, verification, tool contract/permissions, orchestration shape) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** Judge orchestration shape: single bounded ReAct loop vs. plan-then-execute vs. multi-agent, and when *not* to add agents — `lessons/deep-dive.md`, `lessons/harness-verification.md`.
- ✅ **[L4]** Review a harness design and spot boundary misplacement, unbounded loops, and trust-without-verify — `questions/deep-dive.yaml` (code-review MCs + L4 design essay).

## D4 — Problem solving
- ✅ **[L3]** Diagnose a flaky LLM feature to a structural harness gap (validation/retry/verification) rather than the prompt — `lessons/harness-boundary.md`, `questions/deep-dive.yaml`.
- ✅ **[L3]** Choose the right guard for a failure mode: duplicate-call, no-progress, or budget exhaustion — `lessons/harness-loop.md`, `questions/free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a guarded think→act→observe loop returning its stop reason (complete/budget/duplicate-call) — `exercises/harness-loop`, `questions/code.yaml`.
- ✅ **[L4]** Implement deterministic post-action verification and idempotent/retry-safe tools — taught in `lessons/harness-verification.md`; drilled in `exercises/idempotent-tool` (retry-safe idempotency-keyed tool), `questions/frontier-ops.yaml`.
- ✅ **[L4]** Implement argument validation/repair for malformed tool-call JSON — taught in `lessons/harness-boundary.md`; drilled in `exercises/arg-repair` (extract JSON from prose, parse-or-null, coerce numeric-string args), `questions/frontier-ops.yaml`, plus conceptually in `questions/free-entry.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Claude Agent SDK, OpenAI Agents SDK, LangChain/LlamaIndex, smolagents as harness stacks; AutoGPT as the unbounded-loop cautionary tale — `lessons/expert-context.md`.
- ✅ **[L3]** Operational signals for a running harness (steps/task, stop-reason distribution, budget-exhaustion rate, tool-error/retry rate, verification-failure rate, stuck/no-progress detection) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the harness frontier moves (long-horizon autonomy, verifying open-ended tasks, robust error recovery) and how to track it — `reading-list.md` (curated papers/tools + a staying-current method), plus pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags: split model vs. harness responsibilities; bound and verify; avoid "just improve the prompt" — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a harness design under questioning — lead with the boundary, then a ReAct loop with verification, then budgets/termination — `questions/deep-dive.yaml` design essay, `questions/expert.yaml` interview essay.

## Coverage summary
20 items · ✅ 20 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
Full coverage of the current SOTA surface; revisited as the field moves.

<!-- coverage: items=20 covered=20 partial=0 gap=0 -->
