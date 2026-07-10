# Expert Surface — function-calling-reliability

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain why a tool is an API with a contract and the model is an untrusted caller — `lessons/tool-contract.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: contract, schema, dispatcher, validation, idempotency key, side-effect class — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (analogy ↔ dispatcher/validation mechanism) — `lessons/argument-validation.md`, `lessons/idempotency.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** Toolformer (Schick et al. 2023) as tool use becoming a learnable capability — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Gorilla (Patil et al., Berkeley) and the Berkeley Function-Calling Leaderboard as the tool-calling benchmark — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** MCP (Anthropic, 2024) as the open standard for the tool boundary — `lessons/expert-context.md`, `questions/expert.yaml`.
- 🟡 **[L4]** Frontier open problems: reliable multi-tool orchestration, robust argument grounding, exactly-once at scale — named in `lessons/deep-dive.md`/`lessons/expert-context.md`; no dedicated drill.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five function-calling levers (contract typing, validation strictness, read/write separation, idempotency, tool-boundary standardization) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a function-calling layer — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Read/write separation as the foundation for what auto-runs vs. what is safe to retry — `lessons/tool-contract.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a hallucinated/invalid call and choose validate-and-reject with a model-facing error — `lessons/argument-validation.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Diagnose a double-charge to a non-idempotent retry and prescribe idempotency keys + read/write split — `lessons/idempotency.md`, `questions/free-entry.yaml`, `deep-dive.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a validating, idempotent `ToolDispatcher` (reject unknown, validate before execute, dedupe by key) — `exercises/tool-dispatcher`, `questions/code.yaml`.
- ✅ **[L4]** Debug an idempotency bug where a retried write re-runs the side effect (cache read but never populated) — `exercises/idempotent-dispatch-debug`, `questions/deep-dive.yaml`.
- ✅ **[L3]** Design a model-facing structured error contract so a bad call becomes a self-correcting retry — `lessons/build-dispatcher.md`, `questions/build.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** MCP + provider tool/function APIs + Pydantic/Zod validators as the practical stack — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- 🟡 **[L4]** Tool-schema token budget and per-request tool scoping/retrieval at scale — discussed in `lessons/deep-dive.md`; not drilled as an operational exercise.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the function-calling frontier moves (parallel/streaming tool calls, multi-tool orchestration) and how to track it — `reading-list.md`, plus pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags on function-calling reliability (idempotency, hallucinated calls, validation) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a reliable function-calling layer under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
19 items · ✅ 17 covered · 🟡 2 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) ≈ **95%**.
Open frontier work: a multi-tool-orchestration / argument-grounding drill, a tool-schema token-budget
operational exercise, and a WS5 reading-list module tracking parallel/streaming tool calls.

<!-- coverage: items=19 covered=17 partial=2 gap=0 -->
