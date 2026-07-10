# LLM observability — architecture, tradeoffs, and reviewing a design

You already know the mechanics: traces and spans over the call graph, the core signals (tokens,
latency, errors, cost), rolling those up a trace, and drift/canary/capture-replay for change safety.
This lesson zooms out to the **design space**: the levers an observability engineer actually pulls,
what each one trades away, and how to judge someone else's observability design the way an
interviewer or a staff engineer in a design review would.

## The llm-observability design space

Every observability decision is really a decision about **how much signal you keep, at what storage
and privacy cost, and how quickly you can answer "which step went wrong" when an agent misbehaves**.
There are five independent levers, and real systems combine them:

- **Trace granularity** — request-only metrics vs. **span-per-step traces** over the whole call graph.
  An agent turn fans out into planning, tool calls, retrieval, retries, and sub-model calls; a single
  request timer collapses all of that into one number. Span-level traces (following the
  **OpenTelemetry GenAI semantic conventions**, which standardize span names and attributes like model,
  token counts, and cost) let you pinpoint the slow or failing step.
- **Signal richness** — which attributes ride on each span: just latency, or tokens (in/out), a
  latency *breakdown* (TTFT vs. TPOT), errors/retries, and derived cost. Richer signals cost more
  storage and cardinality but are what make rollups and attribution possible.
- **Sampling** — keep every trace, or keep a fraction plus all errored/slow ones (tail sampling).
  Sampling is the main lever on trace volume and cost, and it is where you decide what you can afford
  to *not* be able to debug later.
- **Payload capture** — store the actual prompts and completions for **replay**, or store only the
  numeric signals. Capture buys deterministic reproduction of a failure at the cost of storage and,
  critically, **privacy exposure** (raw prompts carry PII).
- **Change safety** — version-tag every span (prompt/model version) so you can run **canaries** and
  detect **drift**. This turns "did our quality slide?" from a guess into a side-by-side comparison.

## A tradeoff table for llm-observability

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Request-only metrics | Cheap, trivial to add, low cardinality | Blind to *where* time/tokens/cost went inside an agent turn | Simple single-call endpoints, no fan-out |
| Span-per-step traces | Pinpoints the slow/failing step; enables rollups & attribution | Instrumentation effort; storage & cardinality | Any agent or multi-step LLM workflow |
| Full payload capture + replay | Deterministic reproduction of a specific failure | Storage cost and PII exposure; needs redaction | Debugging hard, rare, or high-value failures |
| Tail sampling (keep errors/slow + a fraction) | Big volume/cost cut while keeping the interesting traces | You lose the ability to debug the discarded majority | High-traffic services where 100% is unaffordable |
| Redaction / tokenization at capture | Debuggable traces without hoarding raw PII | Some fidelity loss; redaction rules to maintain | Any payload capture touching user data |
| Version tags + canary + drift trend | Catch silent quality slides before full rollout | Extra signal plumbing; eval scoring cost | Shipping new prompts/models; long-lived systems |

The table is the interview answer in miniature: **name the lever, name what it costs, name the
regime where it wins.** A candidate who says "just log everything" without naming the storage blowup,
the PII risk, and the sampling policy is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** OpenTelemetry-based span traces with token/latency/cost
  attributes, correlation IDs stitched across services, head-based sampling, and dashboards on
  p95/p99 latency and error rate. This is what a default Langfuse/LangSmith/Phoenix-style setup gives
  you, and it is a perfectly good baseline.
- **SOTA (frontier, worth reaching for under real pressure):** OTel GenAI semantic conventions so
  spans are portable across tools, **plus** tail sampling that always keeps errored/slow/expensive
  traces, **plus** redacted payload capture gated by access controls, **plus** version-tagged
  canaries and **drift detection** trending eval scores and input/output distribution — not just
  error counters. The frontier is treating observability as the *quality control loop* of the whole
  system, not just a latency dashboard.
- **Antipattern (looks fine, fails in production):** request-only metrics for an agent (you see
  *that* it was slow, never *where*); logging **raw prompts with PII** verbatim; **no version tags**,
  so a provider model swap silently degrades quality and you cannot even correlate the regression to
  a change; alerting only on loud errors while quality **drift** slides unmonitored. Each of these
  passes a demo and blinds you exactly when a real incident hits.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Trace volume scales with fan-out, not requests.** An agent that averages 8 spans per turn emits
  8× the telemetry of a single-call endpoint at the same request rate. Capacity planning must be done
  in *spans and bytes*, not requests, and sampling is the lever that keeps it affordable.
- **Payload capture dominates storage.** Numeric signals per span are tiny; the prompt and completion
  payloads are orders of magnitude larger. Capturing 100% of payloads is what actually blows the
  budget — hence tail sampling that keeps full payloads only for errored/interesting traces.
- **Observability is not free latency.** Synchronous, blocking export on the request path adds tail
  latency; the discipline (echoing the **Google SRE** tradition) is to emit spans asynchronously and
  batch-export, so instrumentation never becomes the bottleneck it is meant to measure.
- **Cardinality is a silent cost.** High-cardinality attributes (per-user IDs, raw prompt text as a
  label) explode index size and query cost. Keep the numeric signals structured and low-cardinality;
  push the heavy, high-cardinality payloads into sampled capture, not into every metric label.

## Reviewing an llm-observability design

When you are handed an observability design to critique — in a review or an interview — walk the same
checklist:

1. **Request metrics or real traces?** Request-only metrics on an agent is an immediate flag; you
   cannot debug fan-out you never recorded.
2. **Are the core signals on each span?** Tokens (in/out), latency split into TTFT/TPOT,
   errors/retries, and derived cost — or just a wall-clock timer?
3. **What is the sampling policy?** "Keep everything" does not scale and "keep 1% head-sampled" throws
   away your errors. A real design keeps errored/slow/expensive traces and samples the rest.
4. **How is PII handled?** Payload capture with no redaction/tokenization at capture time is a privacy
   incident waiting to happen; access controls and sampling belong here too.
5. **Can you detect a silent regression?** Version tags on every span, a canary path, and drift
   trends on eval scores — or does the plan only page on loud errors while quality drifts unwatched?

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of
these it answers. A toy has request metrics only; a prototype adds span traces with the core signals;
a demo adds sampling and dashboards; a production-ready design also redacts captured PII, version-tags
every span, and closes the loop with canaries and drift detection.
