"""Reference solution: fire budget alerts from a trace's totals."""


def check_budget(trace, cost_budget, latency_budget) -> list:
    alerts = []
    if trace["total_cost"] > cost_budget:
        alerts.append("cost")
    if trace["total_latency_ms"] > latency_budget:
        alerts.append("latency")
    return alerts
