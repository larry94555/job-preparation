"""Tests for summarize. Run: python test_solution.py"""

from solution import summarize

STEPS = [
    {"cost": 0.01, "latency_ms": 100.0, "tool": "search"},
    {"cost": 0.02, "latency_ms": 200.0, "tool": "search"},
    {"cost": 0.03, "latency_ms": 50.0, "tool": "fetch"},
    {"cost": 0.04, "latency_ms": 25.0, "tool": None},
    {"cost": 0.05, "latency_ms": 25.0, "tool": "none"},
]


def test_totals_and_count():
    out = summarize(STEPS)
    assert abs(out["total_cost"] - 0.15) < 1e-9, out
    assert abs(out["total_latency_ms"] - 400.0) < 1e-9, out
    assert out["count"] == 5, out


def test_by_tool_tally():
    out = summarize(STEPS)
    assert out["by_tool"] == {"search": 2, "fetch": 1}, out


def test_none_and_string_none_excluded():
    out = summarize(STEPS)
    assert "none" not in out["by_tool"], out
    assert None not in out["by_tool"], out


def test_empty():
    out = summarize([])
    assert out["count"] == 0, out
    assert out["by_tool"] == {}, out
    assert out["total_cost"] == 0, out
    assert out["total_latency_ms"] == 0, out


test_totals_and_count()
test_by_tool_tally()
test_none_and_string_none_excluded()
test_empty()
print("ALL PASS")
