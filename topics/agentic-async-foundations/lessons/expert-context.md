# Python & async foundations — expert context

## Concurrency is not parallelism

The single sentence that separates someone who *uses* asyncio from someone who *understands* it is Rob
Pike's: **"concurrency is not parallelism."** Concurrency is a way of *structuring* a program so many
tasks can make progress by interleaving; parallelism is *executing* multiple things at the same instant
on multiple cores. asyncio gives you the first, not the second.

Here is the mechanism, named precisely. Python's **asyncio** runs a single-threaded, cooperative
**event loop**. Coroutines — the `async`/`await` machinery standardized in **PEP 492 (Python 3.5)** —
yield control *only* at `await` points; the loop is a scheduler that resumes whichever task is ready.
There is no preemption and no second thread, so at any moment exactly one line of Python is executing.
What you get is overlap of *waiting*, which is exactly right for I/O-bound agent work.

This is also why the **GIL** (Global Interpreter Lock) is almost irrelevant to async and central to
threads. The GIL allows only one thread to execute Python bytecode at a time, so CPU-bound threads
don't run in parallel anyway — they just add context-switching and locking overhead. asyncio sidesteps
that whole problem for I/O: one thread, no lock contention, cooperative scheduling. But the same fact
sets async's hard limit — a CPU-bound coroutine still monopolizes the one thread and stalls the loop.
For real parallelism (CPU-bound work) you reach past asyncio to processes (`multiprocessing`,
`ProcessPoolExecutor`) or a native parallel runtime.

The senior read: use asyncio to overlap I/O waits and fan out calls; do **not** expect it to speed up
computation, and never block its single thread. Knowing which of your bottlenecks is I/O-bound versus
CPU-bound — and therefore whether the answer is concurrency or parallelism — is the judgment this
distinction buys you. It is the same trade explored from the language-runtime side in
[golang-concurrency](../../golang-concurrency/).
