# Reading list & staying current — agentic-observability

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **OpenTelemetry (OTel) docs — traces, spans, metrics.** The open standard whose data model this topic
  uses: a trace is a tree of spans, each span has attributes and a status, and trace context propagates
  parent-child links. Notice that tracing an agent *is* this primitive with LLM attributes (tokens,
  cost, tool), not a new invention.
- **Google Dapper (2010).** The paper that made distributed tracing practical: follow one request across
  services by threading a trace id and parent-span id through every hop. Notice that an agent's tool
  calls are exactly that fan-out, and the trace is how you keep the causal chain in one view.

## Go deeper (spans, metrics & LLM-specific tooling)
- **Langfuse / LangSmith / Helicone docs.** LLM-observability platforms that make token/cost accounting,
  prompt/response capture, and tool-loop trace views first-class. Notice they are OTel-compatible
  observability with the LLM semantics layered on — the same spans, specialized attributes.
- **SLOs & alerting (Google SRE book — chapters on SLOs and on monitoring/alerting).** Where the
  dashboard-vs-alert and budget/threshold discipline comes from. Notice the rule this topic borrows:
  dashboards for the trends you scan, alerts for the thresholds that page you, defined from an SLO.
- **Tail latency ("The Tail at Scale" — Dean & Barroso, 2013).** Why median latency is reassuring and
  misleading, and why p95/p99 is what users feel under concurrency. Notice that the run which hangs is
  the tail, not the average — the core "fine on average, bad at scale" production surprise.

## Frontier — what to watch
- **Cost surprises under load.** Practitioner write-ups on agent bills exploding in production: the
  per-run cost is unchanged but volume, retries, and longer tool loops on messy inputs multiply it.
  Notice cost is a metric you watch in aggregate across runs, not per run.
- **Trajectory / agent evals (LLM-as-judge, trajectory scoring).** The move from scoring a fixed offline
  test set to scoring whole *unlabeled* production trajectories live. Notice the honest read: the metrics
  are easy, the semantics ("did the run accomplish the goal?") are the open part.
- **Semantic observability for agents.** Emerging work on instrumenting the *meaning* of a step, not just
  its cost/latency/error. Notice the failure mode it targets — silent and semantic: nothing errors, cost
  looks normal, and the agent still did the wrong thing.

## How to stay current on this topic
- Follow **OTel** semantic-conventions work for GenAI/LLM spans — the attribute standard is where new
  agent-observability affordances land first.
- Track the **LLM-observability platforms** (Langfuse/LangSmith/Helicone) changelogs and the SRE/SLO
  literature for how alerting and trajectory scoring converge.
- When a new observability technique appears, ask: *what does it measure — mechanics or meaning — what
  does it trade, and what would prove it works at scale?* — the same lens the frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
