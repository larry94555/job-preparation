# Expert Surface — agentic-tool-calling

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain why a model that only talks is a chatbot and a model that calls tools is an agent — `lessons/why-tools.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: tool_use, tool_result, input_schema, required, structured output, validation, recovery — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (agent-vs-chatbot analogy ↔ the tool_use/tool_result loop) — `lessons/why-tools.md`, `lessons/tool-loop.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** OpenAI function calling (2023) and Anthropic tool use as the origin of typed tool signatures — `lessons/expert-context.md`.
- ✅ **[L3]** MCP (Anthropic, 2024) as the open standard for the tool boundary — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Structured-outputs / JSON-schema mode as constrained decoding that guarantees schema-valid output — `lessons/expert-context.md`, `lessons/structured-outputs.md`, `questions/expert.yaml`.
- ✅ **[L3]** JSON-schema `strict` mode (`additionalProperties: false`, all required present) as the tightest constrained-decoding contract — `lessons/structured-outputs.md`, `questions/expert.yaml` (`expert-json-schema-strict`).
- ✅ **[L4]** Frontier open problems: reliable multi-tool orchestration, robust argument grounding, reliability at scale — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml` (`frontier-multitool`, `frontier-reliability-at-scale`).

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** The tool-use loop as an architecture: continue on tool_use, return on end_turn, cap the steps — `lessons/tool-loop.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Parallel tool calls in one turn and binding each tool_result by tool_use_id — `lessons/tool-loop.md`, `questions/expert.yaml` (`expert-parallel-tool-calls`), `questions/mcq.yaml` (`mc-tool-use-id`).
- ✅ **[L3]** Tools as typed contracts and the harness as untrusting executor — `lessons/tool-schema.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Structured-outputs guarantee (shape) vs. validation (semantics) as complementary layers — `lessons/structured-outputs.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose an unknown/malformed tool call and choose validate-and-reject with a model-facing error — `lessons/recovery.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Diagnose silently-trusted model JSON and prescribe parse-then-validate (Pydantic) — `lessons/structured-outputs.md`, `questions/mcq.yaml`, `free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement the agent tool-use loop with a step cap (`run_agent`) — `exercises/tool-loop`, `questions/code.yaml`.
- ✅ **[L3]** Implement schema validation of model JSON output with loud failure (`parse_report`) — `exercises/pydantic-parse`, `questions/code.yaml`.
- ✅ **[L3]** Implement a recovering dispatcher (reject unknown, validate before execute) (`safe_call`) — `exercises/tool-recovery`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** MCP + provider tool/function APIs + Pydantic + structured-outputs modes as the practical stack — `lessons/expert-context.md`, `lessons/structured-outputs.md`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the tool-calling frontier moves (multi-tool orchestration, argument grounding, reliability at scale) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard the shift from talking model to agent and defend validate-and-recover under questioning — `questions/essay.yaml` (`essay-talk-vs-act`, `essay-validate-recover`).
- ✅ **[L4]** Defend the schema-as-contract and the shape-vs-semantics split, and trace the tool-calling canon end to end under questioning — `questions/essay.yaml` (`essay-schema-contract`, `essay-structured-vs-validate`, `essay-tool-canon`).

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (streaming tool calls, long-horizon multi-tool orchestration evals).

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
