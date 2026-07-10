# Reading list & staying current — llm-observability

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **OpenTelemetry GenAI semantic conventions.** The standard that says *what* a trace and span for an
  LLM call should carry. Notice it makes observability portable across vendors: agree on the semantics
  (model, tokens, latency, cost attributes) and any backend can read your traces. This is the single
  most important read for the topic.
- **The trace / span / correlation-ID model (distributed tracing tradition).** Why a single agent turn
  is a *tree* of spans, not one request line. Notice that the correlation (trace) ID is what stitches
  fan-out back together — request-level metrics can't, which is the whole reason the topic exists.

## Go deeper (mechanism & signal design)
- **Google SRE book — postmortems, error budgets, the golden signals.** The reliability-engineering
  tradition observability inherits. Notice how latency/traffic/errors/saturation map onto p95/p99
  latency, cost, and error/retry rate — the operational signals you actually trend and alert on.
- **Token / latency / cost rollups over the span tree.** The mechanism that turns raw spans into a
  bill and an SLO number. Notice a signal is *own value + children, at all depths* — the recursive
  rollup is what lets you point at the one responsible span in a slow or expensive turn.

## Frontier — what to watch
- **Standardized GenAI semantics (still stabilizing).** The OTel conventions are converging but not
  frozen. Watch for the attribute set to settle — that's what lets tools interoperate without glue.
- **Quality-drift detection with no code change.** Catching a silent regression from eval-score and
  output-distribution trends plus canaries. The open question is doing this reliably and cheaply; watch
  for eval-gated, canary-anchored approaches rather than single-threshold alarms.
- **Privacy-preserving traces beyond redaction.** Capturing enough to debug without logging raw PII —
  the frontier moves past field redaction toward tokenization and privacy-preserving capture. Watch for
  approaches that survive an audit, not just a demo.

## Tools & implementations worth reading
- **Langfuse, LangSmith, Arize / Phoenix, Helicone, OpenLLMetry** — the trace-store and dashboard stacks
  that implement these ideas. The field is tooling/standards-led, not paper-led, so reading how one of
  these captures spans and rolls up token/latency/cost is the fastest way to turn the conventions into a
  mental model of real code. **OpenLLMetry** in particular is the shortest path from the OTel spec to
  instrumented calls.

## How to stay current on this topic
- Follow the **OpenTelemetry GenAI semantic-conventions** work and the **Langfuse / LangSmith /
  Arize-Phoenix / OpenLLMetry** repos and release notes — the semantics and features land in code first.
- Track **drift/monitoring practitioner writing** — this topic is standards- and practice-led, so the
  body of knowledge lives in blogs and tool docs more than in papers.
- When a new observability capability appears, ask the three canon questions: *what does it trace/sample/
  redact, what regime does it win in, and what does it cost (cardinality, async export, storage)?* — the
  same lens the deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
