"""Reference solution: route a task to the cheapest capable model tier."""

TIERS = {
    "classify": "cheap",
    "summarize": "cheap",
    "extract": "cheap",
    "draft": "balanced",
    "analyze": "balanced",
    "reason": "best",
    "architecture": "best",
}


def route_to_model(task: str, complexity: str) -> str:
    # Unknown task -> safe middle default, never the weakest tier.
    return TIERS.get(task, "balanced")
