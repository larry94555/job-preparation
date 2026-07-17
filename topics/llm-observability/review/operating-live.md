---
title: "Operating live telemetry"
order: 3
covers:
  - mc-ops-obs-per-route-rollup
  - mc-ops-obs-pii-leak-drift-rate
---
## Operating live telemetry

**In brief.** Once it's live you don't watch "observability" — you watch a handful of signals that
tell you whether your telemetry is **trustworthy, affordable, and safe**. Two of them are specific to
LLM traces and neither can be assumed fine.

**The signals to watch.**

- **Trace and span coverage** — the percentage of turns fully traced, and the headline gauge of whether you can debug at all. If a turn's fan-out (planning, tool calls, retrieval, retries, sub-model calls) isn't fully spanned, you have gaps exactly where incidents hide. Falling coverage — a new code path that emits no spans, a dropped correlation ID — means your observability is quietly lying about completeness.
- **Token, cost, and latency rollups per route** — not one global number but the **recursive** rollup (own value plus children, at all depths) grouped **per route, feature, or tenant**. A single global average hides the offending endpoint. Trend and alert on **p95/p99** latency, cost per route, and error/retry rate: the golden-signals discipline applied per route rather than per service. This is what catches the one endpoint whose average tokens crept up or whose tail latency is dragging.
- **PII-leak rate in traces** — the rate at which raw PII slips past redaction into the trace store, **measured by scanning captured payloads, not assumed to be zero**. Because redaction only catches the fields you named, this is a real, non-zero signal: a rising rate is a privacy incident forming, and it is the operational proxy for whether your capture is audit-survivable.
- **Drift-alert rate** — how often quality-drift detection fires against the version-tagged baseline. Too quiet and the threshold is so loose you'll miss a real regression; too noisy and the team learns to ignore it. Watching the rate, and its precision, is how you keep silent-drift detection honest — by definition nothing else pages when quality slides without an error.

**Capacity and cost.**

- **Trace volume scales with fan-out, not requests.** An agent averaging 8 spans per turn emits eight times the telemetry of a single-call endpoint at the same request rate, so capacity-plan in **spans and bytes**, not requests. Sampling is the lever that keeps it affordable.
- **Payload capture dominates storage** — numeric signals per span are tiny, the prompts and completions are orders of magnitude larger. Tail sampling keeps full payloads only for the errored and interesting traces.
- **Cardinality is a silent cost.** Per-user IDs or raw prompt text as a label explode index size and query cost. Keep the numeric signals structured and low-cardinality; push heavy payloads into sampled capture, not into every metric label.
- Emit spans **asynchronously** and batch-export, so instrumentation never becomes the bottleneck it is meant to measure.

**Why it matters.** Alert on PII-leak rate and per-route error and latency — the incidents you can't
afford to miss — capacity-plan telemetry in spans and bytes, and never trust a dashboard whose trace
coverage you haven't verified: an untraced code path is an unmonitored one.
