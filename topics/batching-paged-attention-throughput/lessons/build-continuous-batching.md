# Build it: a continuous-batching scheduler

## Static vs continuous batching

With **static** batching you gather a fixed batch of requests and run them together — but the batch
isn't *done* until the **slowest** request in it finishes, and the next batch can't start until this
one fully clears. So a batch of mostly-short requests is held hostage by one long one. That's
**head-of-line blocking**, and it wastes GPU time on requests that already finished.

**Continuous** (in-flight) batching schedules at the **iteration level** instead of the batch level.
Every step, each *currently active* request generates one token; the **moment** a request finishes,
its slot is freed and a waiting request is admitted **immediately** — no waiting for the rest of the
batch. Short requests leave, new ones join, and the GPU stays full.

## Simulating it

Model time as discrete steps over an active set capped at `batchSize`:

1. Fill the active set from the waiting queue up to `batchSize`.
2. Each **step**: every active request emits one token (`remaining--`).
3. Requests that hit `0` remaining **finish** and free their slot.
4. Refill the active set from the waiting queue (in order) up to `batchSize`.
5. `makespan` is the step at which the **last** request finishes.

Worked example — `lengths = [10, 1, 1, 1, 1, 1]`, `batchSize = 2`: continuous batching finishes in
**10** steps, versus **12** for static (`[10,1]`→10, `[1,1]`→1, `[1,1]`→1). The five short requests
cycle through the second slot while the length-10 request runs, instead of blocking behind it. That
gap is the throughput continuous batching buys you.
