"""Reference solution: accumulate an agent run into a trace."""


class AgentTrace:
    def __init__(self):
        self.steps = []
        self.total_cost = 0.0
        self.total_latency_ms = 0.0

    def add_step(self, cost, latency_ms, tool=None):
        self.steps.append({"cost": cost, "latency_ms": latency_ms, "tool": tool})
        self.total_cost += cost
        self.total_latency_ms += latency_ms

    def to_dict(self):
        return {
            "steps": len(self.steps),
            "total_cost": self.total_cost,
            "total_latency_ms": self.total_latency_ms,
            "tools": [s["tool"] for s in self.steps if s["tool"] is not None],
        }
