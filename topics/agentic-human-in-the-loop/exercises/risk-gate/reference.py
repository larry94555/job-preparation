"""Reference solution: classify an action by risk."""

HIGH = ("delete", "send_email", "charge_payment", "post_public", "modify_database")
MEDIUM = ("create", "update", "schedule")


def assess_risk(action: str) -> str:
    if action.startswith(HIGH):
        return "high"
    if action.startswith(MEDIUM):
        return "medium"
    return "low"
