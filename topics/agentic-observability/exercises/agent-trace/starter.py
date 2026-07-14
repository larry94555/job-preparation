"""Accumulate an agent run into a trace.

Implement an AgentTrace class:
  - add_step(cost, latency_ms, tool=None):
        append a step to self.steps and accumulate self.total_cost and
        self.total_latency_ms. A step may or may not have a tool.
  - to_dict() -> dict:
        return {
          "steps": <number of steps>,
          "total_cost": <sum of step costs>,
          "total_latency_ms": <sum of step latencies>,
          "tools": [<tool of each step that had one, in order>],
        }
    A step with tool=None counts toward the totals and the step count but
    contributes nothing to "tools".
"""


class AgentTrace:
    def __init__(self):
        raise NotImplementedError

    def add_step(self, cost, latency_ms, tool=None):
        raise NotImplementedError

    def to_dict(self):
        raise NotImplementedError
