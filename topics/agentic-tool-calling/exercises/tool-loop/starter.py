"""Implement the agent tool-use loop.

`client.create(messages)` returns an object with:
  - .stop_reason : "tool_use" or "end_turn"
  - .tool_name   : name of the requested tool   (when stop_reason == "tool_use")
  - .tool_input  : argument passed to the tool   (when stop_reason == "tool_use")
  - .text        : the final answer              (when stop_reason == "end_turn")

Loop:
  - while stop_reason == "tool_use": run tools[tool_name](tool_input),
    append the result to messages, and call client.create again
  - on "end_turn": return .text
  - cap the loop at 10 steps so a misbehaving model can't spin forever
"""


def run_agent(client, user_message, tools):
    raise NotImplementedError
