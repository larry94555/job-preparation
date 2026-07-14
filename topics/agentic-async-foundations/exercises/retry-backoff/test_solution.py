"""Tests for retry_call. Run: python test_solution.py"""

import asyncio

from solution import retry_call


def make_fn(fail_times, value="ok"):
    """An async fn that raises `fail_times` times, then returns `value`."""
    state = {"calls": 0}

    async def fn():
        state["calls"] += 1
        if state["calls"] <= fail_times:
            raise RuntimeError(f"transient {state['calls']}")
        return value

    return fn, state


def make_sleep():
    """An async no-op sleep that records the delays it was asked to wait."""
    delays = []

    async def sleep(delay):
        delays.append(delay)

    return sleep, delays


def test_succeeds_after_k_failures():
    fn, state = make_fn(fail_times=2)
    sleep, delays = make_sleep()
    out = asyncio.run(retry_call(fn, attempts=5, sleep=sleep))
    assert out == "ok", out
    # 2 failures + 1 success = 3 calls; sleeps between the failing tries only.
    assert state["calls"] == 3, state["calls"]
    assert delays == [1, 2], delays  # exponential: 2**0, 2**1


def test_success_first_try_no_sleep():
    fn, state = make_fn(fail_times=0)
    sleep, delays = make_sleep()
    out = asyncio.run(retry_call(fn, attempts=3, sleep=sleep))
    assert out == "ok", out
    assert state["calls"] == 1, state["calls"]
    assert delays == [], delays  # no retry, no sleep


def test_raises_after_exhausting_attempts():
    fn, state = make_fn(fail_times=99)  # always fails
    sleep, delays = make_sleep()
    raised = False
    try:
        asyncio.run(retry_call(fn, attempts=3, sleep=sleep))
    except RuntimeError:
        raised = True
    assert raised, "must re-raise the last exception when attempts are exhausted"
    assert state["calls"] == 3, state["calls"]  # exactly `attempts` tries
    assert delays == [1, 2], delays  # slept between tries, not after the last


test_succeeds_after_k_failures()
test_success_first_try_no_sleep()
test_raises_after_exhausting_attempts()
print("ALL PASS")
