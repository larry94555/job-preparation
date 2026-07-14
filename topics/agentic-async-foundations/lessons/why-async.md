# Python & async foundations — why agents need async

## Agents spend their lives waiting

An agent is not CPU-bound; it is **I/O-bound**. Look at where the wall-clock time actually goes in a
single agent step: a few milliseconds assembling a prompt, then hundreds of milliseconds — or seconds —
*waiting* for the model to respond, waiting for an HTTP API, waiting for a tool to return. The Python
process is almost always idle, parked on a network read. Throughput is governed by how you manage
*waiting*, not by how fast your code computes.

That is why the naive blocking style hurts. If you write a normal loop that calls one tool, waits for
it, then calls the next, each wait is dead time you pay in full and in series:

```python
results = []
for q in queries:
    results.append(fetch(q))   # blocks here until this one returns, every time
```

Ten calls that each wait one second take ten seconds — even though the CPU did nothing for almost all
of it. The waits happen one after another when they could have happened together. The bottleneck is not
the model or the network; it is that the program can only wait on one thing at a time.

## Async lets them wait together

`asyncio`, Python's standard-library async framework, fixes exactly this. A **coroutine** (declared with
`async def`) can *suspend* at an `await` point and hand control back to the **event loop**, which is then
free to advance other coroutines. Nothing runs in parallel — it is one thread — but the *waits overlap*,
which is all an I/O-bound workload needs.

The tool for fanning work out is `asyncio.gather`: give it many awaitables and it schedules them all at
once, then returns their results as a list **in the order you passed them**.

```python
import asyncio

async def gather_calls(client, queries):
    return await asyncio.gather(*(client.fetch(q) for q in queries))
```

Now the ten one-second calls all wait at the same time, so the batch finishes in about one second
instead of ten. That is the **fan-out speedup**, and it is the reason async is foundational for agents:
an agent that calls five tools, or scores twenty candidates, or reads a dozen documents does that work
concurrently instead of paying for each wait in series. This same fan-out shows up in
[golang-concurrency](../../golang-concurrency/) (goroutines over an equivalent idea) and is the backbone
of the [harness-engineering](../../harness-engineering/) that runs real agent loops.
