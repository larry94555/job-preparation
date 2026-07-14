# Production deployment — jobs and polling

## Poll for the result

The submit call returned a `job_id` and nothing else, because the work has not run yet. The caller gets
the result by **polling**: it calls a status endpoint with the job id, and each call answers *where the
job is now*. While the background worker is still running, status is `"queued"` or `"running"` and the
result is `null`; once the worker finishes, status flips to `"done"` and the result is attached (or
`"failed"` with an error). The client loops — ask, wait a little, ask again — until it sees a terminal
status.

```python
# The client polls until the job reaches a terminal state.
def poll(job_id, sleep):
    while True:
        job = job_queue.status(job_id)     # {"status": ..., "result": ...}
        if job["status"] in ("done", "failed"):
            return job                      # terminal — stop polling
        sleep(0.5)                          # brief backoff, then ask again
```

The status endpoint is the mirror image of submit: submit is a fast *write* that never blocks, and
**poll** is a fast *read* that never blocks either. Neither one runs the agent — the worker does that
between them. A **job status** is therefore a small state machine: `queued → running → (done | failed)`,
where `done`/`failed` are terminal and everything the caller needs (`status`, `result`, `error`) lives
on the job record keyed by its id.

This submit/poll split is what makes an agent operable at scale. It decouples request latency from run
latency, lets many workers drain the queue in parallel (see
[task queues and worker pools](../lesson-expert-context)), and gives you a natural place to attach
[per-user rate limits](../lesson-operability) and [multi-tenant isolation](../multi-tenant-isolation/)
so one caller's flood of jobs cannot starve another's. This repo's own
[JobQueue](../../../packages/store/src/queue.ts) is exactly this shape: `enqueue` returns an id,
`claim` moves the oldest queued job to `running`, and `get` reports the current status and result — the
worked example you will re-implement in the exercise.
