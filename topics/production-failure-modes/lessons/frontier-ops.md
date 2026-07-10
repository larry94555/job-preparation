# Production failure modes — the frontier and operating it in production

The deep-dive gave you the levers — detection surface, mitigation policy, containment bounds,
prevention gates, rollout safety. This lesson drills the two things that separate someone who *knows*
the failure catalog from someone who *runs* reliability at the frontier: the current research edge,
and the operational signals you watch when it's live.

## The production-failure-modes frontier

The settled stack — validate-repair-fallback, freshness/TTL, budgets and loop detection, CI eval
gates, canaries — catches a lot. The open problems are the cases it *doesn't*.

- **Catching silent regressions early.** This is the live frontier. A CI eval gate blocks a
  quality drop it can measure on a held-out set, and a canary catches a regression that shows up in
  the slice it watches. But a confident, well-formed, wrong answer behind a clean 200 that slips
  *past both* — a drift that the held-out set doesn't probe and the canary window doesn't surface —
  is still the hard case. The whole point of the topic (silent failures beat loud errors) shows up
  here as an unsolved problem: closing the gap between "shipped" and "noticed" for the failures that
  never throw. The direction to watch is detection that shrinks that gap — richer online eval
  sampling, drift signals on output *content*, not just on error rate.

- **End-to-end failure prediction and graceful multi-failure recovery.** Single-failure playbooks
  are mature: you know how to detect stale retrieval, mitigate malformed JSON, prevent a runaway
  agent. The frontier is two steps harder. **Failure prediction** means seeing a failure *before*
  it lands — reading leading signals (rising fallback rate, creeping eval score) as a forecast, not
  just reacting after the incident. **Multi-failure recovery** means degrading cleanly when several
  failures stack at once — a stale-retrieval answer feeding a malformed tool call feeding a budget
  breach — instead of the guards fighting each other or the system collapsing. Both are named open
  problems, not solved patterns.

The reason to track this line specifically: both directions attack the same weakness in the settled
stack. The settled stack is *reactive and single-failure* — it catches what it can measure, one
mode at a time, after it happens. The frontier is *predictive and compositional* — catch the silent
drift the gates miss, forecast the failure before it lands, and recover when failures compound. An
expert can say which of these a given system is missing.

## Operating for failure in production

When it's live, you don't watch "reliability" — you watch a handful of signals that tell you whether
the system is healthy and where the next failure is forming. The framing is **SRE error budgets
applied to LLMs**: reliability is a spendable tolerance you manage, not a binary you either have or
lack.

- **Error-budget burn rate.** Your SLO implies a budget of allowed failures; burn rate is how fast
  you're spending it. A fast burn (a burst of budget breaches or fallbacks against the SLO) is the
  signal to freeze risky rollouts and stop shipping — the error budget governs how much risk a
  change is allowed to spend before the door closes.
- **Silent-regression detection lead time.** The gap between when a quality regression *shipped* and
  when you *noticed* it. This is the number the frontier is trying to drive toward zero; a growing
  lead time means silent drift is outrunning your detection, and it's the operational proxy for the
  hardest open problem.
- **Guardrail-trigger rate.** How often your guards actually fire — validate-repair-fallback
  degradations, TTL refusals, budget halts, loop-detector trips. A rising trigger rate is a leading
  indicator: the model or its inputs are degrading *before* users see errors, because the guards are
  absorbing the damage. Watch its trend, not just its level.
- **Mean-time-to-detect and mean-time-to-recover (MTTD / MTTR).** How long a failure lives before
  you *see* it, and how long from detection to *fixed*. For silent failures MTTD is the one that
  hurts — a loud crash has near-zero MTTD, but a hallucinated-citation regression can run for days.
  Driving MTTD down is the same fight as shrinking silent-regression lead time; MTTR is what the
  detect → mitigate → prevent loop and blameless postmortems are for.

The operational discipline: alert on **guardrail-trigger rate and error-budget burn rate** (leading
indicators), track **silent-regression lead time and MTTD** as the numbers that expose the failures
error dashboards miss, and never reason about health from error rate alone — the failures that matter
most never move it.
