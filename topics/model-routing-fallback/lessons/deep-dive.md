# Model routing & fallback — architecture, tradeoffs, and reviewing a design

You already know the pieces: cheap→strong cascades, difficulty-based routing, circuit breakers,
retries with backoff, hedged requests, and honest degraded-mode UX. This lesson zooms out to the
**design space** — the levers an engineer actually pulls when building a model gateway, what each one
trades away, and how to judge someone else's routing-and-fallback design the way an interviewer or a
staff engineer in a design review would.

## The model-routing-fallback design space

Every routing decision is really a decision about **which model handles which request, and what
happens when that model is slow, wrong, or down** — under a fixed cost and latency budget. There are
five independent levers, and real gateways (LiteLLM, OpenRouter, home-grown proxies) combine them:

- **Routing policy** — how you pick the first model. Options run from a **static rule** (a model per
  route/tenant), to **difficulty-based routing** (a cheap classifier or heuristic predicts hardness
  and sends easy requests to a small/local model), to a **learned router** (RouteLLM-style, trained
  to predict which model clears a quality bar). More signal buys cost savings but adds a predictor
  you must train, calibrate, and keep honest.
- **Cascade depth** — whether you run **one model** or a **cheap→strong cascade** (FrugalGPT-style)
  where a quality gate escalates only the requests the cheap model fails. Depth buys cost savings on
  the easy majority; it costs a quality gate and extra latency on the escalated tail.
- **Failure handling** — what happens on a timeout, 429, or 5xx: **hard-fail**, **retry with
  backoff+jitter**, **fall back to an alternate provider/model**, or trip a **circuit breaker** so
  calls fail fast instead of piling onto a struggling provider. This is the resilience lever.
- **Latency shaping** — **hedged requests**: after a short delay, fire a duplicate to a backup and
  take whichever answers first. Buys lower p99 at the cost of extra spend and load.
- **Degraded-mode UX** — when the fallback path is a weaker model, whether the substitution is
  **silent** or **honest** (a notice, a lowered-confidence indicator, disabled features). This is a
  product lever, not just an infra one, and it is where trust is won or lost.

## A tradeoff table for model-routing-fallback

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Static per-route model | Dead-simple, predictable cost, easy to reason about | Leaves cost/latency savings on the table; no adaptivity | Small traffic, few routes, quality > cost |
| Difficulty-based routing | Cheap model serves the easy majority → big cost/latency win | A difficulty predictor to build, calibrate, and monitor | Mixed workload where most requests are easy |
| Cheap→strong cascade | Pay for the strong model only on requests that need it | Quality gate to tune; extra hop of latency on escalations | Easy-heavy traffic with a reliable quality signal |
| Fallback + circuit breaker | Survives provider outages/rate limits without hard-failing | Fallback path (often weaker); breaker thresholds to tune | Any production path with an external provider dependency |
| Retry with backoff+jitter | Rides out transient blips without a thundering herd | Added latency on retried calls; must cap attempts | Transient 5xx/429s, many concurrent clients |
| Hedged requests | Cuts p99 tail latency | Extra spend and load from duplicate calls | Latency-sensitive UX, spare capacity to spend |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just add retries and a fallback model" without naming the
retry-storm risk, the breaker, or the silent-degradation problem is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** a primary model with a single fallback provider on
  timeout/5xx/429, retries with exponential backoff and jitter, and a circuit breaker in front of the
  flaky dependency. This is what a default LiteLLM/OpenRouter setup gives you and it is a perfectly
  good baseline.
- **SOTA (frontier, worth reaching for under real pressure):** difficulty-based (or learned) routing
  that sends the easy majority to a cheap/local model, **plus** a cheap→strong cascade with a
  calibrated quality gate, **plus** the resilience stack (breakers + backoff + fallback), **plus**
  hedged requests on latency-critical paths, **plus** an *honest degraded-mode UX* and a **fallback
  rate** metric on the dashboard. The frontier is treating the router as a cost/latency/quality
  controller, not just a switch.
- **Antipattern (looks fine, fails in production):** **silent model substitution** on fallback, so
  users get quietly-worse answers with no signal; **no circuit breaker**, so a struggling provider
  gets buried in retries; **retry storms** from synchronized, unjittered, uncapped retries; a
  difficulty router that is never recalibrated as traffic drifts; or a cascade whose quality gate is
  untuned, so it either passes bad cheap answers or escalates everything and erases the savings. Each
  passes a demo and degrades or falls over under real traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Cost is dominated by the easy majority.** If 80% of requests are easy and a cheap model is ~10×
  cheaper per token, routing the easy 80% to it can cut spend by roughly half — even before any
  cascade. The whole economic case rests on the difficulty predictor being right often enough.
- **The quality gate sets the cost/quality knob.** In a cheap→strong cascade, a gate that escalates X%
  of requests means you pay `cheap + X·strong`. Loosen the gate and cost drops but bad cheap answers
  leak; tighten it and quality rises but savings evaporate. There is no free setting — it is a tunable
  budget line, validated on held-out traffic, not vibes.
- **Retries multiply load exactly when the provider is weakest.** N clients each retrying K times
  during an outage is up to N·K requests hitting a provider that is already failing. Backoff+jitter
  spreads them in time; the circuit breaker caps them entirely by failing fast. Without both, retries
  are a self-inflicted DDoS.
- **Hedging trades spend for tail latency, and it is not free.** Hedging every request after a short
  delay can add meaningful duplicate load; the standard fix is to hedge only past the p95 latency
  threshold so you pay for duplicates on the slow tail, not the whole distribution.

## Reviewing a model-routing-fallback design

When you are handed a routing/fallback design to critique — in a review or an interview — walk the
same checklist:

1. **What decides the route, and is it calibrated?** A difficulty/learned router with no calibration
   or drift monitoring will silently mis-route as traffic shifts.
2. **Where is the quality gate, and how is it tuned?** A cascade with no explicit, validated gate
   either leaks bad cheap answers or escalates everything and loses the savings.
3. **What happens on failure?** No circuit breaker, or uncapped/unjittered retries, is an immediate
   flag — it invites a retry storm onto a struggling provider.
4. **Is the fallback honest?** If the fallback path is a weaker model and the swap is silent, that is
   the classic antipattern; a real design has a degraded-mode UX and emits a **fallback rate** metric.
5. **What does the user experience under pressure?** A real design names what happens when everything
   is slow or down (queue, degrade with a notice, or reject) — never "it just works."

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A toy sends everything to one model; a prototype adds a fallback; a demo adds breakers and
backoff; a production-ready design also routes by difficulty with a tuned gate, bounds retries,
degrades **honestly**, and watches its fallback rate on a dashboard.
