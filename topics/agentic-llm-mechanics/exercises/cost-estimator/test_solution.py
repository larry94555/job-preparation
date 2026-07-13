"""Tests for estimate_cost. Run: python test_solution.py"""

from solution import estimate_cost


def test_known_values():
    # 1000 in @ $0.003/1k = 0.003 ; 500 out @ $0.015/1k = 0.0075 ; total 0.0105
    out = estimate_cost(1000, 500, 0.003, 0.015)
    assert out == 0.0105, out


def test_zero_tokens_is_zero():
    out = estimate_cost(0, 0, 0.003, 0.015)
    assert out == 0.0, out


def test_input_and_output_priced_separately():
    # If in/out were billed at the same price this would differ.
    only_in = estimate_cost(2000, 0, 0.001, 0.010)
    only_out = estimate_cost(0, 2000, 0.001, 0.010)
    assert only_in == 0.002, only_in
    assert only_out == 0.02, only_out


def test_realistic_case_rounds_to_6dp():
    # 3200 in @ $0.0005/1k = 0.0016 ; 800 out @ $0.0015/1k = 0.0012 ; total 0.0028
    out = estimate_cost(3200, 800, 0.0005, 0.0015)
    assert out == 0.0028, out


test_known_values()
test_zero_tokens_is_zero()
test_input_and_output_priced_separately()
test_realistic_case_rounds_to_6dp()
print("ALL PASS")
