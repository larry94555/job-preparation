---
title: "Controlling overlap on a single thread"
order: 1
covers:
  - mc-fanout-speedup
  - mc-create-task
  - mc-blocking
  - frontier-adaptive-concurrency
---
## Controlling overlap on a single thread

**In brief.** An agent is I/O-bound, so its throughput is decided by how much of its waiting happens at
the same time. Overlap is never automatic in either direction: nothing overlaps until you schedule
several coroutines before awaiting, and then everything overlaps until you cap it.

```mermaid
flowchart LR
    A["await one coroutine: no overlap"] --> B["Schedule several, then await"]
    B --> C["gather: everything at once, no throttle"]
    C --> D["Semaphore: bounded overlap"]
    D --> E["Fleet scale: the cap itself must adapt"]
```

**How overlap actually happens.**

- **A coroutine object does nothing on its own** — calling an `async def` function does not run the body; it builds a coroutine object that makes progress only once it is awaited or scheduled on the loop.
- **`await coro` is not concurrency** — it runs that one coroutine to completion before the caller continues. Awaiting inside a loop is the accidental-serialization bug: each call finishes before the next starts, so ten calls that each wait ~1s cost ~10s of dead time paid in series.
- **Several in flight, then await** — `asyncio.create_task(coro)` hands the coroutine to the loop right now and returns a `Task` handle you can await later; `gather` does the same for a whole batch. Now the waits overlap and those ten ~1s calls finish in about 1s — roughly the slowest call instead of the sum. That collapse from sum to slowest is the fan-out speedup.
- **`await` yields, it does not thread** — at an `await` the coroutine suspends and hands control back to the loop, which advances any other ready task. It is one thread throughout; only the waiting overlaps, which is all an I/O-bound workload needs.

**How overlap breaks.**

- **Blocking work freezes everything** — `time.sleep(5)`, a synchronous DB driver, or a heavy CPU loop never reaches an `await`, so it never yields, and the entire single-threaded loop stalls until it returns. Reach for the awaitable equivalent (`await asyncio.sleep(...)`) or push the call off the loop with `asyncio.to_thread` (or `loop.run_in_executor`), which runs it in a thread pool while the loop keeps advancing other tasks.
- **The loop does not auto-throttle** — `gather`, or a loop of `create_task`, launches everything at once. Ten thousand queries means ten thousand in-flight requests, exhausting file descriptors, memory, the connection pool and the upstream's capacity, with timeouts cascading behind.
- **Bounded overlap, not maximal overlap** — an `asyncio.Semaphore(n)` acquired inside each task keeps at most `n` calls in flight while the rest wait their turn: client-side backpressure instead of an unbounded flood. Most of the speedup survives, because total time is roughly batches times slowest-call rather than the sequential sum.

**At fleet scale the cap itself moves.**

- A static `Semaphore(n)` encodes a guess about upstream capacity, and that capacity is not a constant — so a fixed cap is either too conservative (wasted throughput) or too aggressive (rate-limited, cascading timeouts). The static cap itself becomes something you must adapt.
- The signals to steer by are the ones the upstream already sends you: `429`s, timeouts, load that cascades. Expect them as first-class, honor `Retry-After`, back off with jitter, and ideally throttle proactively so you stay under the quota instead of discovering it by being rejected.
- Leaning entirely on the upstream's limiter is not a substitute — unbounded fan-out exhausts your own side too, and rejections just return as retries. Retrying harder into an overloaded service adds load at the exact moment it needs relief.
- None of it is automatic: asyncio makes concurrency trivial to launch and leaves the governing — backpressure, pooling, rate limits — entirely to you.

**Why it matters.** Overlap is something you create and then something you contain, and both halves are
manual: the difference between a demo and a production agent fleet is the governance asyncio hands you
rather than performs for you.
