# Production deployment — the frontier

## Progressive delivery

The async job API, rate limiting, and canary-then-rollback are the solid ground. The frontier is
**progressive delivery** and the operational machinery around it — where deploying an agent stops being
a single switch and becomes a continuously controlled, automated process.

- **Feature flags & progressive delivery.** Instead of a code deploy per change, a **feature flag**
  gates a new behavior behind a runtime toggle you can ramp independently — 1% → 10% → 100% — and kill
  instantly without redeploying. Progressive delivery generalizes the canary: automated ramp-ups gated
  on live metrics, so a rollout advances only while error rates stay healthy and halts (or rolls back)
  itself when they don't. The open part is *what* to gate on for an agent, whose quality is fuzzy and
  not a simple 500-rate.
- **Autoscaling agent workers.** A worker pool that drains the job queue must grow and shrink with load,
  and agent work is spiky and expensive. **Autoscaling on queue depth** (add workers when the backlog
  grows, remove them when it drains) is the pattern, but agents strain it: a run can take minutes and
  cost real tokens, so scaling too eagerly burns budget and scaling too slowly starves the queue.
  Right-sizing a pool whose per-job cost and duration vary wildly is an active operational problem.
- **Deploy-time evals as the gate.** The honest frontier question is *what proves a new agent version is
  safe to widen?* A green unit-test suite doesn't; the field is moving toward **eval gates** — running a
  quality eval on the canary's real traffic and letting *that* decide the ramp. Defining an eval trusted
  enough to auto-promote or auto-rollback a deploy is unsolved, and it is where progressive delivery for
  agents actually lives.

The reason to track this frontier: it is the same discipline this topic is built on — *never ship a slow
or bad change onto the request path* — pushed to the scale where the rollout itself is automated and
metric-gated. An expert can say which of these to invest in first, and does not pretend the eval gate is
a solved problem. See [harness engineering](../harness-engineering/) for the reliability of the worker
these deploys ship.
