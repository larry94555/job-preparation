# Observability & tracing — alerts and dashboards

## Alerts and dashboards

Recording spans is necessary but not sufficient — a trace nobody looks at catches nothing. The two ways
you *act* on the metrics are a **dashboard** you watch and an **alert** that watches for you.

A **dashboard** is the always-on view of the aggregates: cost per hour, p95 latency, failure rate over
time, cost by tool. Its job is to make a trend legible at a glance so you notice the cost line bending
upward *before* it becomes a bill, or the tail latency creeping up *before* users complain. A dashboard
is for the trends you scan; it does not wake anyone up.

An **alert** is the opposite: a rule on a metric that fires when a threshold is crossed, so you do not
have to be staring at the dashboard when things go wrong. You set a budget — a cost ceiling per run, a
latency SLO, a failure-rate limit — and the alert triggers the moment a run or a window breaches it.
The alert catches the incident at 3am; the dashboard is where you go to understand it.

```python
def check_budget(trace, cost_budget, latency_budget):
    alerts = []
    if trace["total_cost"] > cost_budget:
        alerts.append("cost")
    if trace["total_latency_ms"] > latency_budget:
        alerts.append("latency")
    return alerts
```

The rule of thumb: **dashboards for trends, alerts for thresholds.** You define the budgets from what the
metrics taught you — a cost surprise sets a cost alert, a tail-latency surprise sets a latency SLO, a
failure-rate surprise sets a failure alert — and each alert closes the loop from *observing* a
production surprise to *being told* the next time it happens. Without the alert you are back to
discovering incidents from the trace after the fact; with it, the trace explains an incident you were
already paged about.
