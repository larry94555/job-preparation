"""Tests for route. Run: python test_solution.py"""

from solution import route

USERS = ["alice", "bob", "carol", "dave", "erin", "frank", "user-123", "x"]


def test_zero_pct_is_always_stable():
    for u in USERS:
        assert route(u, 0) == "stable", u


def test_hundred_pct_is_always_canary():
    for u in USERS:
        assert route(u, 100) == "canary", u


def test_routing_is_consistent_across_calls():
    for u in USERS:
        first = route(u, 50)
        for _ in range(5):
            assert route(u, 50) == first, u


def test_split_is_monotonic_in_pct():
    # If a user is on the canary at some pct, they stay on it as pct grows.
    for u in USERS:
        if route(u, 30) == "canary":
            assert route(u, 60) == "canary", u


def test_returns_only_the_two_labels():
    for u in USERS:
        for pct in (0, 25, 50, 75, 100):
            assert route(u, pct) in ("canary", "stable")


test_zero_pct_is_always_stable()
test_hundred_pct_is_always_canary()
test_routing_is_consistent_across_calls()
test_split_is_monotonic_in_pct()
test_returns_only_the_two_labels()
print("ALL PASS")
