"""Reference solution: validate a tool observation before feeding it back."""


def validate_observation(obs) -> dict:
    if isinstance(obs, dict) and obs:
        return {"ok": True, "value": obs}
    if isinstance(obs, str) and obs:
        return {"ok": True, "value": obs}
    return {"ok": False, "error": "empty_observation"}
