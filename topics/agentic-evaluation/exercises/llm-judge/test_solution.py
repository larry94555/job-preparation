"""Tests for judge. Run: python test_solution.py"""

import json

from solution import judge


class StubClient:
    """A deterministic stub judge — returns a scripted JSON string."""

    def __init__(self, payload):
        self.payload = payload
        self.seen = None

    def score(self, task, output, criteria):
        self.seen = (task, output, criteria)
        return self.payload


def _raises(client):
    try:
        judge("t", "o", ["c"], client)
    except ValueError:
        return True
    return False


def test_parses_good_verdict():
    client = StubClient(json.dumps({"passed": True, "score": 0.9, "reasoning": "good"}))
    out = judge("summarize", "a fine summary", ["correct", "concise"], client)
    assert out == {"passed": True, "score": 0.9, "reasoning": "good"}, out
    # the judge actually called the client with the task/output/criteria
    assert client.seen == ("summarize", "a fine summary", ["correct", "concise"]), client.seen


def test_failing_verdict_is_parsed_not_raised():
    client = StubClient(json.dumps({"passed": False, "score": 0.2, "reasoning": "off-topic"}))
    out = judge("t", "o", ["c"], client)
    assert out == {"passed": False, "score": 0.2, "reasoning": "off-topic"}, out


def test_score_at_bounds_ok():
    lo = judge("t", "o", ["c"], StubClient(json.dumps({"passed": False, "score": 0, "reasoning": "x"})))
    hi = judge("t", "o", ["c"], StubClient(json.dumps({"passed": True, "score": 1, "reasoning": "x"})))
    assert lo["score"] == 0.0, lo
    assert hi["score"] == 1.0, hi


def test_out_of_range_score_raises():
    assert _raises(StubClient(json.dumps({"passed": True, "score": 1.7, "reasoning": "x"})))
    assert _raises(StubClient(json.dumps({"passed": True, "score": -0.1, "reasoning": "x"})))


def test_non_numeric_score_raises():
    assert _raises(StubClient(json.dumps({"passed": True, "score": "high", "reasoning": "x"})))


def test_bad_json_raises():
    assert _raises(StubClient("not json {"))


test_parses_good_verdict()
test_failing_verdict_is_parsed_not_raised()
test_score_at_bounds_ok()
test_out_of_range_score_raises()
test_non_numeric_score_raises()
test_bad_json_raises()
print("ALL PASS")
