# Production failure modes — freshness, budgets, and guard suites

## Stale retrieval and runaway agents

Two failure modes need their own controls.

**Stale retrieval** is silent: the RAG pipeline runs cleanly but grounds the answer in out-of-date
documents. You detect it by stamping each chunk with a **timestamp or version** and enforcing a
freshness threshold — a **TTL** — at retrieval time. When the best source is older than the TTL, you
flag it, refuse, or re-retrieve from a re-indexed corpus rather than answering confidently from stale
facts.

**Runaway agents** loop or spend without bound. Two controls contain them directly:

- A **budget** — a hard cap on steps, tokens, or dollars that halts the agent when exceeded.
- **Loop detection** — spotting repeated actions or states and tripping when the agent gets stuck.

Neither a bigger model nor more tools fixes a runaway agent; only bounds and loop detection do.

## A `runSafely` guard suite

The unifying pattern is a `runSafely` wrapper that composes these guards around a single model call,
giving **defense in depth** — each guard targets a distinct failure mode so no single check has to
catch everything:

- **Schema / allowlist validation** rejects malformed JSON and hallucinated tool calls, with
  validate-repair-fallback behind it.
- **Freshness (TTL) check** flags or refuses stale retrieval.
- **Budget + loop detection** contains runaway agents.
- **Fallback** guarantees a safe degraded response instead of a crash.

## Silent regressions: CI eval gates and canaries

Silent eval regressions bypass every runtime guard above — the change ships, nothing throws, quality
just drops. Two mechanisms prevent this:

- A **CI eval gate** scores each change against a fixed held-out set and **blocks the merge** when
  scores fall below a threshold, catching the regression before it reaches production.
- A **canary** deploy routes a small slice of live traffic to the new version and watches
  quality/latency/cost against the baseline, so a regression the offline evals missed shows up on a
  limited blast radius before full rollout.

Together they close the loop the runtime guards can't: catching the failures that never announce
themselves.
