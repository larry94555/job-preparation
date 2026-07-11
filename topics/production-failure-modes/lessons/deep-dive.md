# Production failure modes — architecture, tradeoffs, and reviewing a design

You already know the failure catalog, why silent failures are the real danger, and the individual
controls — validators, TTLs, budgets, loop detection, CI eval gates, canaries. This lesson zooms out
to the **design space**: the levers a systems engineer actually pulls when hardening an LLM feature,
what each one trades away, and how to judge someone else's reliability design the way an interviewer
or a staff engineer in a design review would.

## The production-failure-modes design space

Every reliability decision is really a decision about **where on the detect → mitigate → prevent
playbook you spend effort, and whether you are covering loud failures, silent ones, or both**. The
reliability tradition here is not new: it is the **Google SRE** discipline — postmortems and error
budgets — applied to a model layer that can return a confident, well-formed, wrong answer with a
clean HTTP 200. The field checklist is the **OWASP LLM Top 10**. Against that backdrop there are five
independent levers, and real systems combine them:

- **Detection surface** — runtime **validators** (schema/allowlist checks, freshness/TTL checks) that
  inspect *what the model said* versus **eval monitoring** that scores quality over time. Runtime
  validators catch loud, per-request failures; eval monitoring is the only thing that catches silent
  quality drift. Budgeting your instrumentation from error-rate dashboards alone is the classic trap.
- **Mitigation policy** — what happens once a guard trips: **validate-repair-fallback** (re-ask or
  repair, then degrade to a safe default), refuse/flag on stale retrieval, or halt on budget breach.
  The lever is *how gracefully* you degrade, not whether you crash.
- **Containment bounds** — hard **budgets** (max steps, tokens, dollars) plus **loop detection** for
  agents. These bound blast radius and cost regardless of what the model does.
- **Prevention gates** — **CI eval gates** that block a merge when a held-out score drops, plus
  **constrained decoding / strict schemas** and **TTL + re-indexing** pipelines that reduce failure
  likelihood up front.
- **Rollout safety** — **canaries** and **error budgets**: route a small live-traffic slice to a new
  version, watch quality/latency/cost against the baseline, and let the error budget govern how much
  risk a change is allowed to spend before rollout is frozen.

## A tradeoff table for production-failure-modes

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Runtime validators (schema/TTL) | Catch loud, per-request failures instantly; cheap to add | Catch nothing silent; add per-call latency and code | Every production model call — the baseline guard |
| Eval monitoring + CI eval gate | Catches silent quality regressions runtime misses | Needs a held-out set, scoring cost, threshold tuning | Any change to prompt/model/retrieval that can drift quality |
| Validate-repair-fallback | Graceful degradation instead of a crash or garbage | Extra latency/tokens on repair; a masked failure if unlogged | Malformed JSON, hallucinated tool calls |
| Budgets + loop detection | Bounds cost/blast radius of a runaway agent | Can cut off a legitimately long task; tuning the cap | Any autonomous or multi-step agent |
| Canary + error budget | Limited blast radius for regressions offline evals missed | Rollout latency; traffic-splitting and monitoring infra | Risky changes to a high-traffic production path |
| Postmortems | Feeds fixes back into gates and catalog; prevents repeats | Process overhead; needs a blameless culture to work | After any real incident, silent or loud |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just add a try/catch and alert on errors" without naming that
error rate only counts *loud* failures is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** schema validation on outputs, a fallback to a safe default,
  and error-rate alerting. This catches malformed JSON and crashes and is a perfectly good baseline —
  but it is blind to everything silent.
- **SOTA (frontier, worth reaching for under real pressure):** a composed `runSafely` guard suite —
  validate-repair-fallback **plus** freshness/TTL **plus** budgets and loop detection — layered for
  **defense in depth**, **plus** CI eval gates that block regressing merges, **plus** canary deploys
  and an error budget governing rollout, **plus** blameless postmortems that feed each new failure
  back into the catalog and the gates. The frontier is treating the whole **detect → mitigate →
  prevent** loop as one instrumented system, with silent regressions as first-class citizens.
- **Antipattern (looks fine, fails in production):** a **loud-error focus** — investing everything in
  exception handling and error dashboards while nothing inspects output *content*, so hallucinated
  citations, stale-retrieval answers, and eval regressions sail past on clean 200s. Close behind: no
  guardrails at all, no CI eval gate (so any prompt tweak can silently regress), and no postmortems
  (so the same failure recurs). Each of these passes a demo and erodes trust under real traffic.

## Scaling, performance, and the token budget

The numbers and mechanics that make this concrete:

- **Error rate does not scale to correctness.** Error-rate dashboards count only loud failures;
  silent-failure volume is invisible to them by construction. As traffic grows, an unmonitored silent
  regression compounds trust loss linearly with no signal — which is why eval monitoring, not more
  alerting, is the thing that has to scale.
- **Guards cost latency and tokens.** Every runtime validator adds per-call latency; every
  repair/re-ask spends extra tokens and a round trip. Defense in depth is not free — you budget it,
  putting cheap checks (schema, TTL) inline and reserving expensive repair loops for the paths that
  need them.
- **CI eval gates trade merge speed for safety.** A held-out eval set costs scoring time on every
  change, but it is the only mechanism that stops a silent regression *before* production. The cost
  scales with set size; the value scales with how often prompt/model/retrieval changes ship.
- **Canary blast radius is tunable.** Routing 1% of traffic to a new version caps a missed regression
  to 1% of users while it is being watched, at the cost of a slower, more instrumented rollout. The
  error budget decides how much of that risk a change may spend.

## Reviewing a production-failure-modes design

When you are handed a reliability design to critique — in a review or an interview — walk the same
checklist:

1. **Does it inspect output content, or only whether the call returned?** If detection is error-rate
   dashboards only, stop there — it is blind to every silent failure.
2. **Is there an eval gate on quality-affecting changes?** No CI eval gate means any prompt/model/
   retrieval tweak can silently regress and ship.
3. **What happens when a guard trips?** A real design names its mitigation — validate-repair-fallback,
   refuse/re-retrieve on stale, halt on budget — and degrades gracefully, never "it just works."
4. **Are agents bounded?** No budget and no loop detection means one runaway agent burns cost without
   limit.
5. **How do risky changes roll out, and what closes the loop?** Canary + error budget on rollout, and
   **blameless postmortems** feeding fixes back into the catalog and gates — or the same failure
   recurs.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A **toy** relies on error-rate alerting and calls it monitoring; a **prototype** adds
schema validation and a fallback; a **demo-ready** design composes a full `runSafely` guard suite; a
**production-ready** design also gates quality with CI evals, bounds agents, rolls out behind a canary
and error budget, and runs postmortems — treating silent regressions, not loud errors, as the hard
case.
