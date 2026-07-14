"""Reference solution: gate high-risk actions behind approval and audit them."""

HIGH = ("delete", "send_email", "charge_payment", "post_public", "modify_database")
MEDIUM = ("create", "update", "schedule")


def assess_risk(action: str) -> str:
    if action.startswith(HIGH):
        return "high"
    if action.startswith(MEDIUM):
        return "medium"
    return "low"


def execute_with_approval(action, params, approve, execute, audit) -> dict:
    risk = assess_risk(action)

    if risk == "high":
        if not approve(action, params):
            audit.append(
                {"action": action, "params": params, "risk": risk, "decision": "rejected"}
            )
            return {"status": "rejected"}

    audit.append(
        {"action": action, "params": params, "risk": risk, "decision": "executed"}
    )
    return {"status": "executed", "result": execute(action, params)}
