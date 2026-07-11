# LLM observability — the core signals

## Tokens, latency, errors, cost

Every span should carry a small, consistent set of **core signals**:

- **Tokens** — input and output token counts. They drive both cost and, indirectly, latency.
- **Latency** — not one number but a breakdown (see below).
- **Errors & retries** — did the step fail, and how many times did it retry before succeeding?
- **Cost** — derived from tokens and the model's prices.

These four are what you trend, alert on, and roll up. Capturing them per span (rather than only per
request) is what lets you answer *which step* is slow or expensive, not just *whether* the request
was.

## Latency breakdown: TTFT and TPOT

Streaming latency has two distinct parts, and conflating them hides the real behavior:

- **TTFT — Time To First Token.** How long until the first token streams back. It captures prefill
  and any queueing before generation starts.
- **TPOT — Time Per Output Token.** The steady-state per-token decode time *after* the first token.

A request can have a great TPOT but a terrible TTFT (queued behind others) or vice versa; only the
split tells you which. Percentiles (p95/p99) matter more than averages because tail latency is what
users feel.

## Rolling signals up the trace

Because signals live on spans, they **aggregate up the tree**:

- **Cost** = for each span, `input_tokens × in_price + output_tokens × out_price`; sum the span costs
  up the trace to get **per-request** cost, and group by user or feature for attribution.
- **Latency** rolls up along the critical path, so you can see which child span dominated the parent.
- **Errors/retries** roll up into a per-request retry count and failure reason.

The discipline is: record cheap, structured signals on every span, and let the rollups answer the
speed and spend questions after the fact.
