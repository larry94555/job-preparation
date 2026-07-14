"""Validate a handoff between two agents.

validate_handoff(output) -> dict

  - reject an empty handoff (None, "", {}, or []):
        -> {"ok": False, "error": "empty_handoff"}
  - otherwise:
        -> {"ok": True, "value": output}
"""


def validate_handoff(output) -> dict:
    raise NotImplementedError
