"""Validate a model's JSON report the way Pydantic would.

Implement parse_report(raw): json-load `raw` and validate that it has
  - topic         : str
  - summary       : str
  - key_findings  : list of str
  - confidence    : float in [0, 1]
Raise ValueError on ANY violation (missing key, wrong type, out-of-range).
Return the parsed dict when everything is valid.
"""


def parse_report(raw: str) -> dict:
    raise NotImplementedError
