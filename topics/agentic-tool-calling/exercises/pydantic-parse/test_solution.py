"""Tests for parse_report. Run: python test_solution.py"""

import json

from solution import parse_report

VALID = {
    "topic": "agents",
    "summary": "tools make a model act",
    "key_findings": ["loop on tool_use", "validate output"],
    "confidence": 0.8,
}


def _raises(raw):
    try:
        parse_report(raw)
    except ValueError:
        return True
    return False


def test_valid_input_returns_dict():
    out = parse_report(json.dumps(VALID))
    assert out == VALID, out


def test_confidence_is_integer_bound_ok():
    d = dict(VALID, confidence=1)  # JSON int at the boundary is a valid number in range
    out = parse_report(json.dumps(d))
    assert out["confidence"] == 1, out


def test_missing_key_raises():
    for key in ("topic", "summary", "key_findings", "confidence"):
        d = dict(VALID)
        del d[key]
        assert _raises(json.dumps(d)), f"missing {key} should raise"


def test_wrong_type_raises():
    assert _raises(json.dumps(dict(VALID, topic=123)))
    assert _raises(json.dumps(dict(VALID, summary=["not", "a", "string"])))
    assert _raises(json.dumps(dict(VALID, key_findings="not a list")))
    assert _raises(json.dumps(dict(VALID, key_findings=[1, 2, 3])))
    assert _raises(json.dumps(dict(VALID, confidence="high")))


def test_out_of_range_confidence_raises():
    assert _raises(json.dumps(dict(VALID, confidence=1.7)))
    assert _raises(json.dumps(dict(VALID, confidence=-0.1)))


def test_not_json_raises():
    assert _raises("this is not json {")


test_valid_input_returns_dict()
test_confidence_is_integer_bound_ok()
test_missing_key_raises()
test_wrong_type_raises()
test_out_of_range_confidence_raises()
test_not_json_raises()
print("ALL PASS")
