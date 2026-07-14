"""Implement deterministic canary routing.

route(user_id, canary_pct) -> str
  Route a user to the new ("canary") version or the current ("stable") one.
  Use a STABLE hash of user_id that gives the same answer in every process —
  e.g. sum of its UTF-8 bytes mod 100. Do NOT use Python's built-in hash(): it
  is salted per process, so the same user would route differently on different
  workers.

  Return "canary" if hash_to_100(user_id) < canary_pct, else "stable".
    - canary_pct == 0   -> always "stable"
    - canary_pct == 100 -> always "canary"
    - a given user_id must route consistently across calls.
"""


def route(user_id: str, canary_pct: int) -> str:
    raise NotImplementedError
