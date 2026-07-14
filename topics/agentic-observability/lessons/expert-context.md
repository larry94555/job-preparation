# Observability & tracing — expert context

## Traces spans and OpenTelemetry

Agent tracing did not appear from nowhere — it is the LLM-shaped instance of a mature observability
canon, and knowing that canon is what reads as senior.

- **OpenTelemetry (OTel)** is the open standard for traces, spans, and metrics across distributed
  systems. Its data model is exactly the one this topic uses: a **trace** is a tree of **spans**, each
  span records a start/end time, attributes, and status, and **trace context** is propagated so a span
  in one service links to the parent span that caused it. Agent tracing adopts this wholesale — a span
  per model call or tool call, attributes for tokens/cost/latency/tool/error — so agent traces slot into
  the same backends everything else already uses.
- **Distributed tracing** (Dapper, Zipkin, Jaeger) is the older lineage OTel standardized: follow one
  request as it fans out across services by threading a trace id and parent-span id through every hop.
  An agent's tool calls are that same fan-out — the model calls a tool, which calls an API, which calls
  another — and the trace is how you keep the whole causal chain in one view.
- **LLM-observability tooling** — Langfuse, LangSmith, Helicone and peers — layer the agent-specific
  concepts on top: token and cost accounting per span, prompt/response capture, and trace views built
  for model calls and tool loops rather than generic RPCs. They are OTel-compatible observability with
  the LLM semantics (tokens, cost, tool, model) made first-class.

The through-line: a **trace** made of **spans** carrying **latency**, cost, and status is the standard
observability primitive, and agent observability is that primitive with LLM attributes. Knowing that
tracing an agent *is* distributed tracing — not a new invention — is what lets you reuse the tooling
instead of rebuilding it. See [llm-observability](../llm-observability/) for the cross-topic view.
