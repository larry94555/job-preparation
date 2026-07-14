# Production deployment — expert context

## Task queues and worker pools

The submit/poll split has a name in the wider ecosystem: it is a **task queue** with a **worker pool**,
and the pattern long predates agents. Knowing the canon — and which piece gives you which guarantee — is
what reads as senior when you design an agent's deployment.

- **Background jobs vs. blocking.** The foundational move is to take slow work off the request thread and
  onto a queue that workers drain asynchronously. **FastAPI `BackgroundTasks`** is the smallest version
  (run something after the response is sent); a real queue is durable and survives a restart. The point
  is the same one this topic opens with: the request thread returns immediately, the work happens later.
- **Celery / RQ (Redis Queue).** The Python-standard distributed task queues. You `enqueue` a task and
  get back a handle (an `AsyncResult` / job id); a pool of **worker** processes pulls tasks off a broker
  (Redis, RabbitMQ) and runs them. Notice the shape is identical to the job API this topic teaches —
  `submit → job_id → poll` — just backed by a durable broker and many workers instead of one array.
- **Worker pools.** Throughput scales with the number of workers, not with request threads. Many workers
  claim *disjoint* jobs from the same queue — which is why the claim must be atomic. This repo's
  [`claimJob`](../../../packages/store/src/db-ops.ts) uses `FOR UPDATE SKIP LOCKED` so two workers never
  grab the same job; that one SQL clause is the whole concurrency story of a worker pool.

Sitting on top of the queue are the operational concerns the next section covers: **rate limiting** (a
token bucket per user so one caller can't drain the pool), **canary rollout** (send new code to a slice
of traffic first), and **rollback** (one command back to the last good version). Current practice for
deploying an agent is: an async job API + a durable task queue + a worker pool + per-tenant rate limits +
progressive rollout with a fast rollback. Knowing which layer gives a *guarantee* (atomic claim, a hard
rate cap) versus a *best effort* (a canary catching a bad deploy early) is the expert read. See the
[harness engineering](../harness-engineering/) topic for how the worker itself stays reliable under load.
