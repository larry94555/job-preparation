# Reading list & staying current — agentic-deployment

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **FastAPI `BackgroundTasks` (FastAPI docs).** The smallest async job pattern: return the response, run
  the slow work after. Notice the core discipline this whole topic rests on — the request handler does
  fast work and returns immediately; the slow agent run happens off the request thread.
- **Celery / RQ (Redis Queue) docs.** The Python-standard distributed task queues. You enqueue a task and
  get a handle (an `AsyncResult` / job id); a pool of worker processes drains a broker. Notice the shape
  is exactly `submit → job_id → poll`, just durable and multi-worker instead of an in-memory array.

## Go deeper (rate limiting & safe rollout)
- **Token-bucket rate limiting (the classic algorithm).** A bucket of `capacity` tokens refilled at a
  steady rate; each request takes one. Notice the property that makes it the default: it permits short
  bursts but bounds the sustained average rate — which matches real per-user traffic.
- **Canary & blue-green deployments (Martin Fowler / cloud provider deploy guides).** Ship a new version
  to a slice first (canary) or keep two full environments and switch (blue-green). Notice the goal is the
  same — limit the blast radius of a bad change — and that the routing must be sticky and deterministic.
- **Rollback & the 12-Factor App (12factor.net).** Treat config and releases as disposable so reverting is
  one command. Notice *why* rollback beats roll-forward mid-incident: going back to a version that already
  worked is instant, while writing and shipping a fix under fire is not.

## Frontier — what to watch
- **Progressive delivery & feature flags (LaunchDarkly / Argo Rollouts writeups).** Automated, metric-gated
  ramp-ups behind runtime toggles that generalize the canary. Notice the open question for agents: *what
  metric* gates the ramp when quality is fuzzy, not a simple 500-rate.
- **Autoscaling on queue depth (KEDA / cloud autoscaler docs).** Grow and shrink the worker pool with the
  backlog. Notice why agents strain it: runs are slow and expensive, so scaling too eagerly burns budget
  and scaling too slowly starves the queue.
- **Deploy-time evals as the gate (LLM-eval / CI-for-agents writeups).** Running a quality eval on the
  canary's real traffic and letting *that* decide the ramp. Notice the honest read: an eval trusted enough
  to auto-promote or auto-rollback a deploy is unsolved, and it is where progressive delivery for agents
  actually lives.

## How to stay current on this topic
- Follow **task-queue and worker frameworks** (Celery, RQ, Temporal) and their releases — durability,
  retries, and idempotency affordances land there first.
- Track **progressive-delivery tooling** (Argo Rollouts, Flagger) and autoscaler releases for metric-gated
  ramp and queue-depth scaling improvements.
- When a new deploy technique appears, ask: *what does it guarantee vs. merely encourage, what does it
  trade, and what metric proves it safe to widen?* — the same lens the frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
