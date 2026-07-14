# Production deployment — durable jobs

## Durable jobs: retries, idempotency, and the atomic claim

A queued job is a promise: *this work will run.* Keeping that promise under real conditions — dropped
network responses, a downstream API that blips, and more than one worker draining the queue — is what
turns the toy `submit → poll` shape into a **durable** job API. Three concerns carry most of the weight.

**Make submit safe to retry (idempotency).** Networks drop responses. A client that submits, never
hears back, and retries must not create two runs for one task. The fix is an **idempotency key** the
client supplies on submit: if a job already exists for that key, submit returns the *existing* job id
instead of enqueuing a second run. Submit stays a fast write — it just deduplicates first.

```python
def submit(task, idempotency_key) -> str:
    existing = jobs.find_by_key(idempotency_key)
    if existing is not None:
        return existing.id              # retry → same job, no duplicate run
    return jobs.create(task, key=idempotency_key, status="queued").id
```

**Retry transient failures with backoff, then give up cleanly.** A job can fail because a dependency
was briefly down — a transient error, not a bad task. Retry it **with backoff up to a bounded number of
attempts**; if it still fails, mark it terminally `failed` and park it in a **dead-letter queue** for
inspection. What you must *not* do is retry forever (you hammer the dependency) or silently mark it
`done` (you lose the failure). A bounded retry lets a blip self-heal without hiding a real outage.

**Claim atomically so a worker pool is correct.** Throughput scales with the number of workers draining
one queue, not with request threads — but only if each worker claims a *disjoint* job. The claim that
moves a job `queued → running` must be **atomic**: `SELECT ... FOR UPDATE SKIP LOCKED` (or an equivalent
compare-and-set) locks one row and makes other workers skip it, so two workers never grab the same job.
That single guarded step is the whole concurrency story of a worker pool.

```python
# One atomic claim: flip the oldest queued job to running, skipping locked rows.
#   SELECT id FROM jobs WHERE status = 'queued'
#   ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1;
#   UPDATE jobs SET status = 'running' WHERE id = :id;
```

Idempotent submit, bounded retries with a dead-letter queue, and an atomic claim are what let the same
`submit → job_id → poll` shape survive retries, flaky dependencies, and a pool of workers — the machinery
the next lesson names as [task queues and worker pools](../lesson-expert-context). The async contract
never changes: submit stays a fast write, poll stays a fast read, and all of this durability lives on the
worker, off the request thread.
