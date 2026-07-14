"""Filter a proposed agent action before the harness executes it.

Implement filter_output(action): given a proposed action dict like
{"tool": name, ...}, block a disallowed tool and allow everything else.

Rules:
  - if action["tool"] is one of send_email / charge_payment / delete
        -> {"allowed": False, "reason": "blocked_tool"}
  - otherwise
        -> {"allowed": True}
"""


def filter_output(action: dict) -> dict:
    raise NotImplementedError
