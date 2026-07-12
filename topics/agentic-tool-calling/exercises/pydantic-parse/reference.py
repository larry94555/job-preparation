"""Reference solution: validate a model's JSON report."""

import json


def parse_report(raw: str) -> dict:
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, TypeError) as e:
        raise ValueError(f"not valid JSON: {e}")

    if not isinstance(data, dict):
        raise ValueError("report must be a JSON object")

    for key in ("topic", "summary", "key_findings", "confidence"):
        if key not in data:
            raise ValueError(f"missing key: {key}")

    if not isinstance(data["topic"], str):
        raise ValueError("topic must be a string")
    if not isinstance(data["summary"], str):
        raise ValueError("summary must be a string")

    findings = data["key_findings"]
    if not isinstance(findings, list) or not all(isinstance(x, str) for x in findings):
        raise ValueError("key_findings must be a list of strings")

    confidence = data["confidence"]
    # bool is a subclass of int/float in Python — reject it explicitly.
    if isinstance(confidence, bool) or not isinstance(confidence, (int, float)):
        raise ValueError("confidence must be a number")
    if not 0.0 <= confidence <= 1.0:
        raise ValueError("confidence must be in [0, 1]")

    return data
