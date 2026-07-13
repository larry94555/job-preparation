"""Reference solution: gate a proposed action against an allow-list."""

_BLOCKED = {"send_email", "charge_payment", "delete"}


def filter_output(action: dict) -> dict:
    if action.get("tool") in _BLOCKED:
        return {"allowed": False, "reason": "blocked_tool"}
    return {"allowed": True}
