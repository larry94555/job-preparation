---
title: "The frontier: progressive delivery and autoscaling"
order: 2
covers:
  - frontier-deploy
  - frontier-autoscale-workers
---
## The frontier: progressive delivery and autoscaling

**In brief.** The async job API, rate limiting, and canary-then-rollback are the solid ground. The
frontier is where the rollout ramps **itself** and the worker pool sizes **itself** — and for agents both
are genuinely open, because agent quality is fuzzy and agent jobs are spiky and expensive.

**The open problems.**

- **Progressive delivery with feature flags** — the canary generalized. A **feature flag** gates a new behavior behind a runtime toggle you can ramp independently of a code deploy (1% → 10% → 100%) and kill instantly without redeploying. Progressive delivery automates the ramp: the rollout advances only while live metrics stay healthy, and halts or rolls itself back when they don't.
- **What gates the ramp** — the honest open part. An agent's quality is not a simple 500-rate, so **what** to gate the ramp on is unsolved. A green unit-test suite does not prove a new agent version safe to widen.
- **Autoscaling agent workers** — the pattern is scaling the pool on **queue depth**: add workers when the backlog grows, remove them when it drains. That works for ordinary web requests, which are cheap and roughly uniform. Agent jobs are not: a run can take seconds or minutes and cost real tokens, so depth alone misleads — scale too eagerly and you burn budget, too slowly and you starve the queue. Right-sizing a pool whose per-job cost and duration vary wildly is an active operational problem. Per-tenant rate limits in front keep one caller from draining the pool, but they bound the inflow rather than tell you how big the pool should be.
- **Deploy-time eval gates** — running a quality eval on the canary's real traffic and letting **that** decide the ramp. Defining an eval trusted enough to auto-promote or auto-rollback a deploy is unsolved, and it is where progressive delivery for agents actually lives.

**Why it matters.** The expert move is naming the practice — progressive delivery, feature flags,
autoscaling on queue depth — while being honest that for agents the gate metric and the pool sizing are
open problems, rather than pretending a green test suite, a faster load balancer, or one-worker-per-queued-job
makes the ramp safe.
