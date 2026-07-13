# Python & async foundations — error isolation

## One failure should not sink the batch

Fan-out creates a new failure mode. When you `gather` a batch of calls, what happens if *one* of them
raises? By default, `asyncio.gather` propagates the **first** exception straight up to the caller — and
in doing so you lose the results of every other call in the batch, including the ones that already
succeeded. One flaky tool call sinks the whole fan-out. For an agent scoring twenty candidates or
calling five tools, that is exactly the wrong behavior: you want the nineteen good results and a marker
on the one that failed.

The fix built into asyncio is `return_exceptions=True`. With it, `gather` no longer raises on the first
failure; instead it **returns the exception object in that slot**, so the batch always completes and you
inspect each result individually:

```python
raw = await asyncio.gather(*coros, return_exceptions=True)
results = []
for r in raw:
    if isinstance(r, Exception):
        results.append({"ok": False, "error": str(r)})   # isolated failure
    else:
        results.append({"ok": True, "value": r})
```

Now a raiser is *contained*: it becomes one `{"ok": False, ...}` entry while every sibling call still
returns its value in order. The equivalent hand-rolled pattern is wrapping each task's body in
`try/except` so its exception is caught locally and turned into a result rather than allowed to abort the
group — either way, the principle is the same: **isolate each unit of work so one failure is a data
point, not a crash.**

This is where the whole section comes together. A **timeout** bounds each individual call, **retries
with backoff and jitter** recover the transient failures, and **error isolation** contains whatever
still fails so the rest of the fan-out succeeds. The three compose into a batch that is fast (concurrent),
patient (bounded retries), and robust (no single call can take down the group) — the resilience posture
every production agent loop needs. See [production-failure-modes](../../production-failure-modes/) for
the failure taxonomy this defends against.
