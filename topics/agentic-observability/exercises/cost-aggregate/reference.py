"""Reference solution: aggregate trace steps into run-level metrics."""


def summarize(steps) -> dict:
    total_cost = 0.0
    total_latency_ms = 0.0
    by_tool = {}
    for s in steps:
        total_cost += s["cost"]
        total_latency_ms += s["latency_ms"]
        tool = s.get("tool")
        if tool is None or tool == "none":
            continue
        by_tool[tool] = by_tool.get(tool, 0) + 1
    return {
        "total_cost": total_cost,
        "total_latency_ms": total_latency_ms,
        "count": len(steps),
        "by_tool": by_tool,
    }
