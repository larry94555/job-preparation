"""Parse a ReAct step block into its parts.

Implement parse_react(text):
  Given a block with lines like
    Thought: <reasoning>
    Action: <tool>
    Action Input: <rest>
  return {"thought": ..., "action": ..., "action_input": ...}.

  If there is no Action line (a final, thought-only step), return
    {"thought": ..., "action": None, "action_input": None}.

  Strip surrounding whitespace from each captured value.
"""


def parse_react(text) -> dict:
    raise NotImplementedError
