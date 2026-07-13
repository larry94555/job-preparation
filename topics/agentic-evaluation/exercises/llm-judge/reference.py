"""Reference solution: an LLM-as-judge call with a validated strict-JSON verdict."""

import json


def judge(task, output, criteria, client) -> dict:
    raw = client.score(task, output, criteria)
    try:
        verdict = json.loads(raw)
    except (json.JSONDecodeError, TypeError) as e:
        raise ValueError(f"judge did not return valid JSON: {e}")

    if not isinstance(verdict, dict):
        raise ValueError("verdict must be a JSON object")

    for key in ("passed", "score", "reasoning"):
        if key not in verdict:
            raise ValueError(f"verdict missing key: {key}")

    score = verdict["score"]
    # bool is a subclass of int/float in Python — reject it explicitly.
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise ValueError("score must be a number")
    if not 0.0 <= score <= 1.0:
        raise ValueError("score must be in [0, 1]")

    return {
        "passed": bool(verdict["passed"]),
        "score": float(score),
        "reasoning": str(verdict["reasoning"]),
    }
