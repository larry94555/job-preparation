"""Validate a tool observation before feeding it back into the loop.

Implement validate_observation(obs):
  - non-empty dict or non-empty string -> {"ok": True, "value": obs}
  - None, "" (empty string), or {} (empty dict) -> {"ok": False, "error": "empty_observation"}

Reject the bad observation at the boundary so the agent never reasons over garbage.
"""


def validate_observation(obs) -> dict:
    raise NotImplementedError
