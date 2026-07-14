# Expert Surface — agentic-async-foundations

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain why an agent is I/O-bound and why async (overlapping waits) is the right fit — `lessons/why-async.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: coroutine, async/await, event loop, gather, timeout, backoff, jitter, return_exceptions — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (the "wait together" intuition ↔ the event-loop/await mechanism) — `lessons/why-async.md`, `lessons/async-patterns.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** PEP 492 async/await and the asyncio event loop as the origin of native coroutines — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** "Concurrency is not parallelism" (Rob Pike) and the role of the GIL in why threads ≠ parallel Python — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Exponential backoff with jitter as the canonical retry discipline (AWS builders' library) — `lessons/resilient-calls.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Canon depth: PEP 492 native coroutines vs. generator-based `yield from`, and full/decorrelated jitter as the AWS-canon backoff refinement — `questions/expert.yaml` (`expert-pep492-coroutines`, `expert-backoff-jitter-canon`).
- ✅ **[L4]** Frontier open problems: bounded concurrency/backpressure, connection pooling, and rate-limit awareness at scale — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.
- ✅ **[L4]** Adaptive concurrency control as an open problem: static caps are wrong under drifting upstream capacity, so congestion-signal-driven (AIMD/TCP-style) limiters are the frontier — `questions/frontier-ops.yaml` (`frontier-adaptive-concurrency`).

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** The fan-out with gather as an architecture: schedule concurrently, preserve order, overlap waits — `lessons/async-patterns.md`, `questions/mcq.yaml`.
- ✅ **[L3]** The resilience trio — timeout, bounded retry with backoff/jitter, error isolation — as complementary layers — `lessons/resilient-calls.md`, `lessons/error-isolation.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Concurrency (structuring) vs. parallelism (executing), and choosing async vs. processes by bottleneck — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Structured & bounded concurrency as architecture: create_task/TaskGroup for scoped lifetimes, Semaphore for backpressure, to_thread for blocking escapes, as_completed for streaming — `lessons/structured-concurrency.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a blocking call stalling the single-threaded loop and prescribe the awaitable/executor fix — `lessons/async-patterns.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Diagnose a batch where one failure sinks the fan-out and prescribe return_exceptions / per-task isolation — `lessons/error-isolation.md`, `questions/mcq.yaml`, `essay.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement an order-preserving concurrent fan-out (`gather_calls`) — `exercises/async-fanout`, `questions/code.yaml`.
- ✅ **[L3]** Implement a bounded retry with exponential backoff and an injected sleep (`retry_call`) — `exercises/retry-backoff`, `questions/code.yaml`.
- ✅ **[L3]** Implement error isolation over a concurrent batch (`run_all`) — `exercises/isolate-failures`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** asyncio + a pooled async HTTP client (httpx) + tenacity-style retries + semaphores as the practical stack — `lessons/resilient-calls.md`, `lessons/frontier-ops.md`, `reading-list.md`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the async-at-scale frontier moves (structured concurrency/TaskGroup, backpressure, rate limits) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard the fan-out speedup and defend the timeout/retry/isolation posture under questioning — `questions/essay.yaml` (`essay-why-async`, `essay-resilience`).

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (structured concurrency defaults, adaptive rate limiting, distributed backpressure).

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
