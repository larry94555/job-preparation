"""Tests for gate. Run: python test_solution.py"""

from solution import gate


def test_above_bar_passes():
    assert gate({"pass_rate": 0.95}, 0.9) is True


def test_below_bar_fails():
    assert gate({"pass_rate": 0.87}, 0.9) is False


def test_exactly_on_bar_passes():
    # >= so a run landing exactly on the threshold passes
    assert gate({"pass_rate": 0.9}, 0.9) is True


def test_zero_and_one_bounds():
    assert gate({"pass_rate": 0.0}, 0.0) is True
    assert gate({"pass_rate": 1.0}, 1.0) is True
    assert gate({"pass_rate": 0.0}, 0.5) is False


test_above_bar_passes()
test_below_bar_fails()
test_exactly_on_bar_passes()
test_zero_and_one_bounds()
print("ALL PASS")
