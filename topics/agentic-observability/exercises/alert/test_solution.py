"""Tests for check_budget. Run: python test_solution.py"""

from solution import check_budget


def test_over_cost_only():
    trace = {"total_cost": 5.0, "total_latency_ms": 100.0}
    assert check_budget(trace, cost_budget=1.0, latency_budget=1000.0) == ["cost"]


def test_over_latency_only():
    trace = {"total_cost": 0.5, "total_latency_ms": 5000.0}
    assert check_budget(trace, cost_budget=1.0, latency_budget=1000.0) == ["latency"]


def test_over_both_order():
    trace = {"total_cost": 5.0, "total_latency_ms": 5000.0}
    assert check_budget(trace, cost_budget=1.0, latency_budget=1000.0) == ["cost", "latency"]


def test_within_budget_empty():
    trace = {"total_cost": 0.5, "total_latency_ms": 100.0}
    assert check_budget(trace, cost_budget=1.0, latency_budget=1000.0) == []


def test_exactly_at_budget_is_within():
    trace = {"total_cost": 1.0, "total_latency_ms": 1000.0}
    assert check_budget(trace, cost_budget=1.0, latency_budget=1000.0) == []


test_over_cost_only()
test_over_latency_only()
test_over_both_order()
test_within_budget_empty()
test_exactly_at_budget_is_within()
print("ALL PASS")
