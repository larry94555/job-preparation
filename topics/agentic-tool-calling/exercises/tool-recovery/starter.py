"""Recover from bad tool calls instead of crashing.

Implement safe_call(registry, name, args):
  registry maps a name -> {"handler": fn, "validate": fn-or-None}

Rules:
  - unknown name                     -> {"ok": False, "error": "unknown_tool"}  (do NOT raise)
  - validate present and validate(args) is False
                                     -> {"ok": False, "error": "invalid_args"}  (handler NOT run)
  - otherwise                        -> {"ok": True, "value": handler(args)}
"""


def safe_call(registry, name, args) -> dict:
    raise NotImplementedError
