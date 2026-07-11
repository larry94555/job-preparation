# Expert Surface — llm-observability

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain why request-level metrics are insufficient for agents — a turn fans out into a tree of steps — `lessons/tracing.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: trace, span, correlation/trace ID, TTFT/TPOT, drift, canary, redaction — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Explain span nesting as a tree over the call graph and roll signals up it — `lessons/tracing.md`, `lessons/build-token-rollup.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** OpenTelemetry GenAI semantic conventions as the trace/span standard — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** The field is tooling/standards-led (Langfuse, LangSmith, Arize/Phoenix, Helicone, OpenLLMetry), not paper-led — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L4]** Practitioner drift/monitoring literature as the body of knowledge — framed in `lessons/expert-context.md`; drilled in `questions/frontier-ops.yaml` (`mc-obs-drift-literature`: data vs concept drift vs quality regression).
- ✅ **[L4]** Frontier awareness: stabilizing OTel GenAI semantic conventions, privacy-preserving traces beyond redaction, and automated silent-drift detection — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five observability levers (granularity, signal richness, sampling, payload capture, change safety) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for an observability design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Trace volume scales with fan-out, not requests; cardinality and async export as costs — `lessons/deep-dive.md`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a slow/expensive agent turn to the responsible span via per-step signals — `lessons/signals.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Choose a sampling + redaction policy under storage/PII pressure — `lessons/drift-and-capture.md`, `questions/deep-dive.yaml`.
- ✅ **[L4]** Detect silent quality drift with no code change (eval-score/distribution trend + canary) — taught in `lessons/drift-and-capture.md`; drilled as a worked diagnosis in `questions/frontier-ops.yaml` (`mc-obs-silent-diagnosis-1`/`-2`: model-swap vs input-drift, canary-anchored).

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a recursive token rollup over a span tree (own tokens + children, all depths) — `exercises/token-rollup`, `questions/code.yaml`, `questions/build.yaml`.
- ✅ **[L4]** Instrument a call with OTel-style spans (attributes, correlation-ID propagation, async export) — mechanics in `lessons/tracing.md`/`deep-dive.md`; coding exercise `exercises/span-tree`, `questions/frontier-ops.yaml` (`code-obs-span-tree`: correlation-ID propagation over a span tree).
- ✅ **[L4]** Implement redaction/tokenization at capture time — `exercises/redact-capture`, `questions/frontier-ops.yaml` (`code-obs-redact`).

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Langfuse / LangSmith / Arize-Phoenix / Helicone / OpenLLMetry as the trace-store & dashboard stacks — `lessons/expert-context.md`.
- ✅ **[L3]** Operational signals to trend and alert on (p95/p99 latency, cost, error/retry rate, drift) — `lessons/signals.md`, `lessons/deep-dive.md`.
- ✅ **[L4]** Operate observability in production: trace/span coverage, per-route token/cost/latency rollups, PII-leak rate in traces, and drift-alert rate — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the frontier moves (stabilizing OTel semantics, quality-drift detection, privacy-preserving traces) and how to track it — pointers in `lessons/expert-context.md`; curated reading-list module in `reading-list.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags (request-only metrics for agents, raw-PII logging, no version tagging) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend an OTel-based observability design under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
22 items · ✅ 22 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
The three former partials are now closed in `questions/frontier-ops.yaml`: OTel-style span
instrumentation by the `exercises/span-tree` coding exercise (`code-obs-span-tree`), the practitioner
drift/monitoring literature by `mc-obs-drift-literature`, and silent quality-drift detection as a
worked diagnosis by `mc-obs-silent-diagnosis-1`/`-2`. No partials or gaps remain.

<!-- coverage: items=22 covered=22 partial=0 gap=0 -->
