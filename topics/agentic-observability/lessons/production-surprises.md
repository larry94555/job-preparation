# Observability & tracing — the production surprises

## What surprises you in production

An agent that looks fine in development has a way of behaving differently the moment real traffic hits
it. The surprises are not random — they cluster into a few **metrics** that dev testing systematically
under-samples, and tracing is what makes them visible before they become an incident.

- **Cost under load.** In development you run the agent a handful of times and the bill is a rounding
  error. In production the *same per-run cost* multiplied by real volume — plus longer tool loops on
  messy real inputs — turns into a number that surprises everyone. The per-run cost did not change; the
  count did, and a retry or an extra tool step on each run compounds it. Cost is a metric you watch in
  aggregate across runs, not per run.
- **Latency under load.** Median latency in dev is reassuring and misleading. Under concurrency, queuing
  and slow tools stretch the **tail**: the p95 and p99 latencies are far worse than the median you
  tested, and they are what users actually feel. The run that hangs is rarely the average run — it is
  the tail, and only per-span latency across many runs shows it.
- **Failure rate under load.** A tool that works every time in ten dev runs fails one time in a thousand
  under real inputs — a timeout, a rate limit, a malformed response. That tail of failing runs is
  invisible until you are running enough volume to hit it, and it is exactly the part no test covered.

```python
def summarize(spans):
    return {
        "total_cost": sum(s["cost"] for s in spans),
        "total_latency_ms": sum(s["latency_ms"] for s in spans),
        "count": len(spans),
    }
```

The common thread: dev-scale testing sees the median of a small sample; production reveals the
**aggregate and the tail** of a large one. The metrics that surprise you — cost, latency, failure rate —
are all "fine on average, bad at scale." You only catch them by recording every span and watching the
totals and the tail, not by re-running the happy path a few more times. See
[cost-attribution](../cost-attribution/) for slicing cost by model and tool.
