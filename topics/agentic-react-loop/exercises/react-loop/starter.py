"""Implement the single-agent ReAct loop.

`client.step(messages)` returns an object with:
  - .kind        : "action" or "final"
  - .tool        : name of the requested tool   (when kind == "action")
  - .tool_input  : argument passed to the tool  (when kind == "action")
  - .answer      : the final answer             (when kind == "final")

Loop:
  - while kind == "action": run tools[tool](tool_input), append the observation
    to messages, and call client.step again
  - on "final": return {"answer": answer, "steps": n, "log": [...]}
    where n is the number of model steps taken
  - if max_steps is reached without a final, return
    {"answer": None, "steps": max_steps, "stopped": "step_limit", "log": [...]}
"""


def run_react(client, task, tools, max_steps=10):
    raise NotImplementedError
