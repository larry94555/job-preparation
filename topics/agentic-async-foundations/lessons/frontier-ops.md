# Python & async foundations — the frontier

## Concurrency at scale

Timeouts, retries, and error isolation are the solid ground. The frontier is what happens when a fleet
of agents fans out not ten calls but *thousands*, concurrently, against services that push back. The
tools that made small fan-outs effortless turn into footguns at scale, because `asyncio.gather` will
cheerfully launch unbounded concurrency — and unbounded concurrency is the problem.

- **Backpressure and bounded concurrency.** An unbounded `gather` over ten thousand queries opens ten
  thousand in-flight requests at once, exhausting file descriptors, memory, and the upstream service's
  capacity. The fix is a **semaphore** (or a fixed worker pool) that caps how many calls run at a time,
  applying backpressure so you overlap *enough* work to stay fast without overwhelming either end.

  ```python
  sem = asyncio.Semaphore(20)          # at most 20 concurrent calls
  async def bounded(q):
      async with sem:
          return await client.fetch(q)
  await asyncio.gather(*(bounded(q) for q in queries))
  ```

- **Connection pooling.** Thousands of concurrent calls must share a **pooled** HTTP client with sane
  connection limits, not open a fresh socket per request. A pool with a bounded size is itself a form of
  backpressure, and reusing connections avoids the handshake cost that dominates at high request rates.

- **Rate-limit awareness.** Model and tool APIs enforce request- and token-per-minute quotas. At scale
  you must *expect* `429`s and treat them as first-class: honor `Retry-After`, back off with jitter, and
  ideally throttle proactively so you stay under the limit instead of discovering it by getting rejected.

The honest read is that none of this is automatic. asyncio makes concurrency trivial to *launch* and
leaves the *governing* — backpressure, pooling, rate limits — entirely to you. Getting that governance
right is the distributed-systems edge that separates a demo from a production agent fleet, and it is the
same territory the [harness-engineering](../../harness-engineering/) and
[production-failure-modes](../../production-failure-modes/) topics operate in.
