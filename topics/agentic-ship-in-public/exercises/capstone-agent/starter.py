"""The capstone agent: assemble tool calling, a bounded loop, and observation validation.

`client.step(messages)` returns an object with:
  - .kind        : "action" or "final"
  - .tool        : name of the requested tool   (when kind == "action")
  - .tool_input  : argument passed to the tool   (when kind == "action")
  - .answer      : the final answer              (when kind == "final")

Implement run_capstone(client, task, tools, max_steps=8):
  - start messages with the user task
  - loop up to max_steps:
      - out = client.step(messages)
      - on "final": return {"answer": out.answer, "steps": <steps taken>, "trace": [...]}
      - on "action": observation = tools[out.tool](out.tool_input)
          - VALIDATE it: if empty or None, record {"tool": tool, "ok": False} in the trace
            and feed an error note back into messages
          - otherwise record {"tool": tool, "ok": True} and feed the observation back
  - if max_steps is reached with no final, return
    {"answer": None, "steps": max_steps, "stopped": "step_limit", "trace": [...]}
"""


def run_capstone(client, task, tools, max_steps=8) -> dict:
    raise NotImplementedError
