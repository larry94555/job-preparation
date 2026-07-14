"""Aggregate a list of trace steps into run-level metrics.

Implement summarize(steps): steps is a list of dicts, each with
  - "cost"       : a number
  - "latency_ms" : a number
  - "tool"       : a tool name, or None / "none" for no tool

Return:
  {
    "total_cost":       <sum of cost>,
    "total_latency_ms": <sum of latency_ms>,
    "count":            <number of steps>,
    "by_tool":          {tool: <number of steps that used it>},
  }
A step whose tool is None or the string "none" is NOT counted under any
tool in by_tool (treat both as "no tool").
"""


def summarize(steps) -> dict:
    raise NotImplementedError
