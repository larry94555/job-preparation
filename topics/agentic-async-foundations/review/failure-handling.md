---
title: "Classifying, bounding, and containing failures"
order: 2
covers:
  - fe-timeout-fn
  - mc-cancellation
  - mc-transient-vs-permanent
---
## Classifying, bounding, and containing failures

**In brief.** Every call an agent makes crosses a network to a service that will eventually misbehave,
so failures are expected input rather than exceptional events. Handling them is three separate
decisions: bound each wait, retry only what a retry can fix, and contain whatever still fails.

**Bound each call, on its own.**

- **A timeout is the first line of defense** — an unbounded `await` waits forever if the other side hangs, silently freezing the agent. `asyncio.wait_for(coro, timeout=...)` bounds that wait and surfaces `asyncio.TimeoutError` to the caller, turning a permanent stall into a normal, catchable error you can retry or record.
- **Per call, not per batch** — the bound belongs on each individual call. Wrap each coroutine in its own timeout and one hang becomes one isolated error while its siblings still finish; a single timeout around the whole fan-out instead kills every in-flight call, letting the slow one take the healthy ones down with it.
- **The bound is enforced, not merely abandoned** — the discipline throughout this topic is that no work outlives the scope that owns it. Bare tasks leak: when one raises, the others may keep running unsupervised. A `TaskGroup` cancels its siblings on failure for exactly that reason, making "nothing survives its scope" structural rather than something you remember to handle.

**Retry only what a retry can fix.**

- **Transient means noise** — a `503`, a tool timing out, a connection reset. These often succeed on a later attempt, which is what a bounded retry is for.
- **Permanent means the request itself is wrong** — a genuine, permanent error fails identically on every attempt, so retrying it changes nothing and burns the bounded attempt budget you were holding for real noise. Classify first: retry the retryable, fail fast on the rest.
- **Bounded, spaced, desynchronized** — give up after N attempts so a downed service can't trap you; grow the delay exponentially (1s, 2s, 4s…) so an overloaded service gets room instead of more load; and jitter each delay so many clients don't retry in lockstep and arrive as a thundering herd.

**Contain what still fails.**

- **The default sinks the batch** — `asyncio.gather` propagates the first exception straight to the caller and discards every sibling result, including the calls that already succeeded.
- **`return_exceptions=True`** — gather places the exception object in that slot instead of raising, so the batch always completes and you inspect each result individually. Wrapping each task's body in `try`/`except` is the hand-rolled equivalent.
- **Failure as a data point** — either way the principle holds: isolate each unit of work so one flaky call becomes an `{"ok": false, ...}` entry rather than a group abort.

**Why it matters.** Bound, recover, contain are three different jobs — a timeout bounds each call,
retries with backoff and jitter recover the transient ones, and isolation contains the rest — and a
fan-out is only fast, patient, and robust when all three are present.
