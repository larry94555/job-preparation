"""Tests for AgentTrace. Run: python test_solution.py"""

from solution import AgentTrace


def test_totals_and_step_count():
    t = AgentTrace()
    t.add_step(0.01, 100.0, tool="search")
    t.add_step(0.02, 250.0, tool="fetch")
    t.add_step(0.03, 50.0)  # no tool
    d = t.to_dict()
    assert d["steps"] == 3, d
    assert abs(d["total_cost"] - 0.06) < 1e-9, d
    assert abs(d["total_latency_ms"] - 400.0) < 1e-9, d


def test_tools_list_skips_none_and_keeps_order():
    t = AgentTrace()
    t.add_step(0.01, 100.0, tool="search")
    t.add_step(0.01, 100.0)  # None
    t.add_step(0.01, 100.0, tool="fetch")
    d = t.to_dict()
    assert d["tools"] == ["search", "fetch"], d


def test_empty_trace():
    t = AgentTrace()
    d = t.to_dict()
    assert d["steps"] == 0, d
    assert d["total_cost"] == 0 or d["total_cost"] == 0.0, d
    assert d["total_latency_ms"] == 0 or d["total_latency_ms"] == 0.0, d
    assert d["tools"] == [], d


def test_accumulates_across_many_steps():
    t = AgentTrace()
    for _ in range(5):
        t.add_step(1.0, 10.0, tool="x")
    d = t.to_dict()
    assert d["steps"] == 5, d
    assert abs(d["total_cost"] - 5.0) < 1e-9, d
    assert abs(d["total_latency_ms"] - 50.0) < 1e-9, d
    assert d["tools"] == ["x", "x", "x", "x", "x"], d


test_totals_and_step_count()
test_tools_list_skips_none_and_keeps_order()
test_empty_trace()
test_accumulates_across_many_steps()
print("ALL PASS")
