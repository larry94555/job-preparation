"""Tests for TokenBucket. Run: python test_solution.py"""

from solution import TokenBucket


def test_burst_up_to_capacity_then_denies():
    b = TokenBucket(capacity=3, refill_per_sec=1.0)
    # three back-to-back calls at the same instant: all allowed
    assert b.allow(now=0.0) is True
    assert b.allow(now=0.0) is True
    assert b.allow(now=0.0) is True
    # bucket empty at the same instant: denied
    assert b.allow(now=0.0) is False


def test_refill_reallows_after_enough_time():
    b = TokenBucket(capacity=1, refill_per_sec=1.0)
    assert b.allow(now=0.0) is True     # consume the only token
    assert b.allow(now=0.0) is False    # empty
    assert b.allow(now=1.0) is True     # 1s * 1 token/s refills one → allowed


def test_partial_refill_does_not_allow_early():
    b = TokenBucket(capacity=1, refill_per_sec=1.0)
    assert b.allow(now=0.0) is True
    assert b.allow(now=0.5) is False    # only half a token refilled → still denied
    assert b.allow(now=1.0) is True     # now a full token is available


def test_refill_capped_at_capacity():
    b = TokenBucket(capacity=2, refill_per_sec=1.0)
    # idle a long time: tokens must not exceed capacity
    assert b.allow(now=100.0) is True   # start full, consume one (2 -> 1)
    assert b.allow(now=100.0) is True   # 1 -> 0
    assert b.allow(now=100.0) is False  # empty; capacity was never exceeded despite the long idle


test_burst_up_to_capacity_then_denies()
test_refill_reallows_after_enough_time()
test_partial_refill_does_not_allow_early()
test_refill_capped_at_capacity()
print("ALL PASS")
