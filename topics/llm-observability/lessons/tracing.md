# LLM observability — traces & spans

## Why request metrics are not enough

For an ordinary web service, a request-level metric — latency, status code, error rate — tells you
most of what you need. For an **LLM agent** it does not. A single user request **fans out** into a
tree of steps: the model plans, calls tools, retrieves context, hits a rate limit and **retries**,
then calls a sub-model. One aggregate timer collapses all of that into a single number that hides
*where* the time, tokens, errors, and cost actually went.

Observability for LLM systems is therefore built on **structured traces** of the whole call graph,
not request-only metrics. The interview signal is exactly this: knowing *why* request metrics are
insufficient for agents.

## Traces, spans, and correlation IDs

Three ideas carry the whole model:

- A **trace** is the end-to-end record of one request.
- A **span** is one unit of work inside it — a single model call, tool call, or retrieval — with its
  own start/end time, inputs, and signals. Spans **nest**: a parent span (the agent turn) contains
  child spans (each tool and model call), forming a tree over the call graph.
- A **correlation ID** (also called a trace ID) is threaded through every step and every service so
  the spans they each emit can be **stitched back into one trace** — even across process and network
  boundaries.

Without the correlation ID, spans from different services are just disconnected log lines. With it,
you can follow a single request end to end, see its structure, pinpoint the slow or failing step, and
later roll token counts and cost up the tree.
