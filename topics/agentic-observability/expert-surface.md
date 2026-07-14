# Expert Surface — agentic-observability

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain why, without a per-step trace, debugging a production agent is guessing — `lessons/tracing.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: trace, trace_id, span, tokens/cost/latency/tool/error, metrics, dashboard, alert — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (a run "is slow" ↔ "span 3 of run r-4817 spent 8s in search_web") — `lessons/tracing.md`, `lessons/spans.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** OpenTelemetry as the trace/span/metrics standard and its trace-tree + context-propagation model — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Distributed tracing (Dapper/Zipkin/Jaeger) as the lineage agent tracing inherits — `lessons/expert-context.md`.
- ✅ **[L3]** LLM-observability tooling (Langfuse, LangSmith, Helicone) as OTel-compatible with LLM semantics made first-class — `lessons/expert-context.md`, `reading-list.md`.
- ✅ **[L4]** Frontier open problems: semantic/agent-specific observability and evaluating trajectories in production — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** A span per step as the unit of detail — tokens, cost, latency, tool, error — and a trace as its ordered list — `lessons/spans.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Why per-step spans beat run-level totals (a single slow/failing step is invisible in the total) — `lessons/spans.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Dashboards for trends vs. alerts for thresholds as complementary ways to act on metrics — `lessons/alerts.md`, `questions/mcq.yaml`.
- ✅ **[L4]** Spans as a tree, not a flat list: nested tool/sub-agent steps as child spans and trace-context propagation across boundaries so one logical run stays one trace — `questions/mcq.yaml` (`mc-trace-tree`, `mc-context-propagation`), `questions/expert.yaml` (`expert-span-tree`).

## D4 — Problem solving
- ✅ **[L3]** Diagnose a cost/latency/failure surprise as "fine on a small sample, bad at scale" (aggregate + tail) — `lessons/production-surprises.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Attribute a slow or failing run to the exact span (tool + latency + error) rather than guessing — `lessons/spans.md`, `questions/mcq.yaml`, `free-entry.yaml`.
- ✅ **[L3]** Turn spans into the metrics you watch — slice cost by tool/model, aggregate over a window, and read the tail (p95/p99) rather than the mean — `lessons/reading-metrics.md`, `questions/mcq.yaml` (`mc-cost-per-tool`, `mc-p99-vs-avg`), `questions/expert.yaml` (`expert-token-metrics`).

## D5 — Engineering & code craft
- ✅ **[L3]** Implement a trace that accumulates per-step cost/latency and collects tools (`AgentTrace`) — `exercises/agent-trace`, `questions/code.yaml`.
- ✅ **[L3]** Implement run-level aggregation with a per-tool tally and a None/"none" edge case (`summarize`) — `exercises/cost-aggregate`, `questions/code.yaml`.
- ✅ **[L3]** Implement threshold alerts from a trace's totals with a strict-boundary rule (`check_budget`) — `exercises/alert`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** OTel + LLM-observability platforms (Langfuse/LangSmith/Helicone) + dashboards + alerting/SLOs as the practical stack — `lessons/expert-context.md`, `lessons/alerts.md`.
- ✅ **[L4]** SRE alerting discipline applied to agents: alerts off an SLO on the tail, sustained over a window / by burn rate, to page on incidents not noise — `questions/mcq.yaml` (`mc-alert-threshold`), `questions/expert.yaml` (`expert-slo-alerting`), `questions/essay.yaml` (`essay-alert-design`).

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the observability frontier moves (semantic observability, trajectory evals in prod, sampling at scale) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard a trace/span design and defend dashboards-for-trends / alerts-for-thresholds under questioning — `questions/essay.yaml` (`essay-tracing`, `essay-production`).

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (semantic trajectory scoring, sampling that never drops the rare failing run).

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
