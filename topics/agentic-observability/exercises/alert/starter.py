"""Fire budget alerts from a trace's totals.

Implement check_budget(trace, cost_budget, latency_budget):
  trace is a dict with "total_cost" and "total_latency_ms".

Return a list of alert strings, one per budget exceeded:
  - "cost"    when trace["total_cost"] > cost_budget
  - "latency" when trace["total_latency_ms"] > latency_budget
Order: "cost" before "latency" when both are exceeded.
A value exactly equal to its budget is WITHIN budget (no alert).
Return an empty list when the trace is within both budgets.
"""


def check_budget(trace, cost_budget, latency_budget) -> list:
    raise NotImplementedError
