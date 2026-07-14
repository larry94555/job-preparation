"""Route a task to the cheapest capable model tier.

Implement route_to_model(task, complexity): return a TIER string.
  - simple tasks  ("classify", "summarize", "extract")  -> "cheap"
  - medium tasks  ("draft", "analyze")                  -> "balanced"
  - hard tasks    ("reason", "architecture")            -> "best"
  - any unknown task name                               -> "balanced"

Route on the task name. `complexity` is a hint you may consult, but the
named-task mapping decides the tier.
"""


def route_to_model(task: str, complexity: str) -> str:
    raise NotImplementedError
