# Reading list & staying current — agentic-async-foundations

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **asyncio docs (Python standard library).** The event loop, coroutines, `await`, and `asyncio.gather`
  this topic teaches. Notice that it is a *single-threaded cooperative* loop: `await` is a yield point,
  and a blocking call freezes the whole loop.
- **PEP 492 — Coroutines with async and await syntax (Python 3.5).** Where native `async`/`await` entered
  the language. Notice the reframing — a coroutine is an object that only makes progress when awaited or
  scheduled, distinct from a generator-based coroutine.

## Go deeper (concurrency vs. parallelism, resilience)
- **"Concurrency is not parallelism" — Rob Pike (2012 talk).** The mental model that separates structuring
  concurrent work from executing it in parallel. Notice why asyncio gives you concurrency (overlapping
  I/O waits) but not parallelism (simultaneous CPU execution), and how the GIL makes that distinction bite.
- **Timeouts, retries and backoff with jitter — Marc Brooker / the AWS Builders' Library.** The canonical
  treatment of why retries need *exponential* backoff and *jitter*. Notice the thundering-herd failure:
  synchronized retries hammer a recovering service, and jitter spreads them out.
- **httpx docs (async client, connection pooling & limits).** The async HTTP client agents actually use.
  Notice connection *pooling* and *limits* — a bounded pool is itself backpressure, and reuse avoids the
  per-request handshake cost that dominates at scale.

## Frontier — what to watch
- **tenacity (retry library).** Production retries as a declarative policy: stop conditions, exponential
  backoff, jitter, and retry-on predicates. Notice the durable takeaway — the *policy* (bounded, backed
  off, jittered) matters more than the loop you hand-write.
- **Structured concurrency & `asyncio.TaskGroup` (Python 3.11+).** Grouping tasks so lifetimes and errors
  are scoped and cancellation propagates cleanly. Notice how it makes "one failure should not leak" a
  structural property rather than something you remember to code.
- **Semaphores & bounded concurrency at scale.** `asyncio.Semaphore` (or a worker pool) as the primitive
  for backpressure. Notice *what* it fixes — an unbounded `gather` exhausts pools and trips rate limits;
  the semaphore caps in-flight work so overlap stays fast without overwhelming either end.

## How to stay current on this topic
- Track **CPython release notes** for asyncio — structured concurrency (TaskGroup), timeouts
  (`asyncio.timeout`), and cancellation semantics are where the ergonomics keep improving.
- Follow **httpx / tenacity** changelogs for pooling, retry, and rate-limit affordances.
- When a new concurrency or resilience pattern appears, ask: *what does it guarantee vs. merely encourage,
  what does it trade, and does it bound concurrency and failure?* — the same lens the frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
