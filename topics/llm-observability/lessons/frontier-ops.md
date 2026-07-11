# LLM observability — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
LLM observability from someone who *runs* it at the frontier: the current research edge, and the
operational signals you watch when it's live.

## The llm-observability frontier

Three directions are where observability work is actually moving right now — and none of them is
"solved" the way tracing itself now is.

- **OpenTelemetry GenAI semantic conventions are still stabilizing.** The bet the field made — that
  observability should be a *portable, vendor-neutral standard* rather than every tool inventing its own
  schema — aged very well, but the standard itself is not frozen. The `gen_ai.*` attribute set (model,
  tokens, latency, cost, and increasingly agent/tool-call and content-capture semantics) is still
  largely experimental, and its scope keeps growing from single-call tracing toward agent orchestration.
  The practical takeaway: instrument against the conventions to stay portable, but expect attribute
  churn and pin/opt-in to a convention version so a spec bump doesn't silently break your dashboards.
  Read them as "the direction," not "the frozen spec."

- **Privacy-preserving traces beyond redaction.** Field-level redaction — masking or tokenizing known
  PII before it hits the trace store — is the current baseline, but it's brittle: it only catches the
  PII you thought to name, and captured prompts/completions are exactly where sensitive data hides. The
  frontier moves past redaction toward capture that survives an *audit*, not just a demo:
  tokenization/pseudonymization at capture time, and privacy-preserving capture that keeps a trace
  debuggable without hoarding raw user text. The mental model to carry: capture is a privacy liability,
  and "we redact the obvious fields" is the classic way to ship a leak the redaction rules never saw.

- **Automated silent-drift / quality-regression detection.** Tracing and cost rollups converged; the
  genuinely open problem is catching a *silent* quality slide with **no code change** — a provider model
  swap, a shifting input distribution, or a slowly rotting prompt that never throws an error. Alerting
  on loud errors misses all of it. The direction is eval-gated, canary-anchored detection — trending
  eval scores and input/output distribution against a version-tagged baseline — rather than a single
  static threshold. The distinguishing expert claim: drift is a *trend* over a versioned baseline, and a
  system that only pages on 5xx errors is blind to the failure mode that actually degrades a mature
  product.

The reason to track these three specifically: they map onto the topic's three durable open problems —
standardized semantics, privacy-preserving capture, and quality-drift detection. Tooling solved the
easy 80% (spans, correlation IDs, token/cost rollups); these are the 20% an expert can speak to.

## Operating LLM observability in production

When it's live, you don't watch "observability" — you watch a handful of signals that tell you whether
your telemetry is trustworthy, affordable, and safe.

- **Trace/span coverage (% of turns fully traced).** The headline gauge of whether you can debug at
  all. If a turn's fan-out — planning, tool calls, retrieval, retries, sub-model calls — isn't fully
  spanned, you have gaps exactly where incidents hide. Falling coverage (a new code path that emits no
  spans, a dropped correlation ID) means your "observability" is quietly lying about completeness.

- **Token / cost / latency rollups per route.** Not one global number but the recursive rollup (own +
  children, all depths) grouped **per route / feature / tenant**. This is what turns raw spans into a
  bill and an SLO: it's how you catch the one endpoint whose average tokens crept up, or the route
  whose p95 latency is dragging the tail. Trend and alert on p95/p99 latency, cost per route, and
  error/retry rate — the golden-signals discipline applied per route, not per service.

- **PII-leak rate in traces.** The rate at which raw PII slips past redaction into the trace store —
  measured by scanning captured payloads, not assumed to be zero. Because redaction only catches named
  fields, this is a real, non-zero signal you must monitor: a rising PII-leak rate is a privacy incident
  forming, and it's the operational proxy for "is our capture audit-survivable?"

- **Drift-alert rate.** How often quality-drift detection fires — eval-score or distribution-shift
  alerts against the version-tagged baseline. Too quiet and you've set the threshold so loose you'll
  miss a real regression; too noisy and the team learns to ignore it. Watching the *rate* (and its
  precision) is how you keep silent-drift detection honest, since by definition nothing else pages when
  quality slides without an error.

The operational discipline: alert on **PII-leak rate and per-route error/latency** (the incidents you
can't afford to miss), capacity-plan telemetry in **spans and bytes** (trace volume scales with
fan-out, not requests), and never trust a dashboard whose **trace coverage** you haven't verified —
an untraced code path is an unmonitored one.
