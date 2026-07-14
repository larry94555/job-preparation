"""Gate a high-risk action behind a human approval, and audit every decision.

Implement execute_with_approval(action, params, approve, execute, audit):
  - risk = assess_risk(action)   (imported from your risk-gate work; a copy is inlined below)
  - if risk == "high":
        if not approve(action, params):
            append a REJECTED record to audit and return {"status": "rejected"}
        # approved: fall through to execute
  - always append an audit record for what happened, then
  - return {"status": "executed", "result": execute(action, params)}

`approve(action, params) -> bool` is the human-in-the-loop gate.
`execute(action, params)` performs the action and returns its result.
`audit` is a list; append a dict describing each decision to it.

Rules that matter:
  - a REJECTED high-risk action must NOT call execute
  - a low/medium action does NOT need approval — execute directly
  - every path that reaches a decision leaves an audit record behind
"""

HIGH = ("delete", "send_email", "charge_payment", "post_public", "modify_database")
MEDIUM = ("create", "update", "schedule")


def assess_risk(action: str) -> str:
    if action.startswith(HIGH):
        return "high"
    if action.startswith(MEDIUM):
        return "medium"
    return "low"


def execute_with_approval(action, params, approve, execute, audit) -> dict:
    raise NotImplementedError
