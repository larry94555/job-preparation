# Expert context: papers, frontier & interview

## Papers people and the frontier

LLM observability is a **tooling- and standards-led** field, not a paper-led one — there is no
canonical "attention is all you need" here. What you should be able to name is the emerging standard
and the tools that implement it, plus the practitioner writing on drift/monitoring.

- The standard to know is the **OpenTelemetry (OTel) GenAI semantic conventions**: a shared spec for
  how GenAI **traces and spans** are structured — what a span represents, and which attributes (model,
  tokens, latency, cost) get recorded — so that traces are portable across tools instead of every
  vendor inventing its own schema. When an interviewer asks "which standard defines GenAI trace/span
  semantics?" the answer is OpenTelemetry's GenAI semantic conventions.
- The tools you'd reference are **Langfuse, LangSmith, Arize/Phoenix, Helicone, and OpenLLMetry**.
  These are the trace stores and dashboards that capture spans, roll up tokens/latency/cost, and
  increasingly emit OTel-compatible data.
- Beyond the standard, the useful body of knowledge is **practitioner writing on drift and
  monitoring** rather than academic papers — how to trend quality, catch distribution shift, and run
  canaries.

Current SOTA is **OTel-based tracing with token / latency / cost rollups**, plus **drift and canary
detection** layered on top. Open problems experts still argue about: **standardized semantics** (the
conventions are still stabilizing), **quality-drift detection** (catching gradual quality regressions
without a code change), and **privacy-preserving traces** (keeping traces debuggable without hoarding
raw PII). The honest framing for an interview is that this space is defined by converging **standards
and tools**, not by a small set of landmark papers.

## Interviewing on LLM observability

What a strong interviewer probes here:

- Can you explain **why request-level metrics are insufficient for agents**? One agent request fans
  out into planning, tool calls, retrieval, retries, and sub-model calls — a single aggregate metric
  hides where time, tokens, errors, and cost actually go. Traces and spans are the answer.
- Do you know **what to trace, sample, redact, and alert on**? Trace spans with correlation IDs;
  sample to control volume and cost; redact PII at capture time; alert on latency/cost/error-rate and
  on **drift** in quality or input distribution.
- Can you name the **standard** (OTel GenAI semantic conventions) and the **tools** (Langfuse,
  LangSmith, Arize/Phoenix, Helicone, OpenLLMetry) — and frame the field correctly as standards- and
  tooling-led rather than paper-led?

**Red flags** that sink candidates: relying on **request-only metrics for agents** (no per-step
visibility), **logging raw PII** verbatim into the trace store, and shipping prompt/model changes with
**no version tagging** so you can't tell which version produced a regression. Asked to design
observability for an LLM system, lead with **OTel-structured traces + spans + correlation IDs**, then
**token/latency/cost rollups**, then **drift and canary detection with redaction and version tags** —
and be clear that the state of the art here is defined by standards and tools, not landmark papers.
