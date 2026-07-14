"""Classify an action by how much damage it could do.

Implement assess_risk(action): return a risk level string.
  - "high"   : the action is irreversible or expensive — it starts with one of
               delete / send_email / charge_payment / post_public / modify_database
  - "medium" : the action creates or changes owned state — it starts with one of
               create / update / schedule
  - "low"    : anything else (a read, a lookup, a no-op)

The comparison is by prefix: "delete_user" and "delete" are both high risk.
"""


def assess_risk(action: str) -> str:
    raise NotImplementedError
