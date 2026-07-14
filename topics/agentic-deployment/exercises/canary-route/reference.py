"""Reference solution: deterministic canary routing with a stable hash."""


def hash_to_100(user_id: str) -> int:
    # Stable across processes, unlike Python's salted hash().
    return sum(user_id.encode("utf-8")) % 100


def route(user_id: str, canary_pct: int) -> str:
    return "canary" if hash_to_100(user_id) < canary_pct else "stable"
