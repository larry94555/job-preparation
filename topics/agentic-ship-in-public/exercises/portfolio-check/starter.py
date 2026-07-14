"""Check whether a project is a shippable portfolio piece.

Implement portfolio_ready(project):
  project is a dict. A shippable portfolio piece needs non-empty values for the keys
    "agent", "readme", "evals", "demo"
  (a value counts as missing if the key is absent or its value is empty — "", [], None, etc.)

Return {"ready": bool, "missing": [...]}:
  - "missing" is the sorted list of required keys that are absent or empty
  - "ready" is True exactly when "missing" is empty
"""


def portfolio_ready(project) -> dict:
    raise NotImplementedError
