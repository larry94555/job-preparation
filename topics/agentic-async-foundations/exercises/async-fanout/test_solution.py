"""Tests for gather_calls. Run: python test_solution.py"""

import asyncio

from solution import gather_calls


class FakeClient:
    """Async client that tracks how many fetches are in flight at once.

    fetch bumps an in-flight counter, records the running max, yields the event
    loop a few times (so genuinely concurrent fetches can overlap), then
    decrements. A sequential solution never has more than 1 in flight; a
    concurrent one reaches len(queries).
    """

    def __init__(self):
        self.in_flight = 0
        self.max_concurrent = 0

    async def fetch(self, q):
        self.in_flight += 1
        self.max_concurrent = max(self.max_concurrent, self.in_flight)
        # Yield several times so all concurrently-scheduled fetches get a turn
        # to register before any of them completes. No real time elapses.
        for _ in range(5):
            await asyncio.sleep(0)
        self.in_flight -= 1
        return f"result:{q}"


def test_preserves_order():
    client = FakeClient()
    queries = ["a", "b", "c", "d"]
    out = asyncio.run(gather_calls(client, queries))
    assert out == ["result:a", "result:b", "result:c", "result:d"], out


def test_runs_concurrently():
    client = FakeClient()
    queries = ["q1", "q2", "q3", "q4", "q5"]
    asyncio.run(gather_calls(client, queries))
    assert client.max_concurrent > 1, (
        f"fetches must overlap; max in-flight was {client.max_concurrent} "
        "(a sequential loop never exceeds 1)"
    )
    assert client.max_concurrent == len(queries), client.max_concurrent


def test_empty():
    client = FakeClient()
    out = asyncio.run(gather_calls(client, []))
    assert out == [], out


test_preserves_order()
test_runs_concurrently()
test_empty()
print("ALL PASS")
