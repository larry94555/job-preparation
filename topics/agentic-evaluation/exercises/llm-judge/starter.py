"""Implement an LLM-as-judge call.

`client.score(task, output, criteria)` returns a JSON STRING, e.g.
  '{"passed": true, "score": 0.9, "reasoning": "answers the question, no fabrications"}'

Implement judge(task, output, criteria, client):
  - call client.score(task, output, criteria) to get the verdict string
  - parse it as JSON
  - return {"passed": bool, "score": float, "reasoning": str}
  - raise ValueError if score is not a number in [0, 1]
"""


def judge(task, output, criteria, client) -> dict:
    raise NotImplementedError
