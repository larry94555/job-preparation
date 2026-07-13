"""Tests for run_all. Run: python test_solution.py"""

import asyncio

from solution import run_all


def test_mix_success_and_failure():
    async def ok(v):
        await asyncio.sleep(0)
        return v

    async def boom(msg):
        await asyncio.sleep(0)
        raise ValueError(msg)

    coros = [ok(1), boom("bad"), ok(3)]
    out = asyncio.run(run_all(coros))
    assert out == [
        {"ok": True, "value": 1},
        {"ok": False, "error": "bad"},
        {"ok": True, "value": 3},
    ], out


def test_one_raiser_does_not_sink_others():
    ran = {"n": 0}

    async def ok(v):
        await asyncio.sleep(0)
        ran["n"] += 1
        return v

    async def boom():
        raise RuntimeError("nope")

    # The raiser sits in the middle; every ok() must still complete.
    coros = [ok("a"), boom(), ok("b"), ok("c")]
    out = asyncio.run(run_all(coros))
    assert ran["n"] == 3, ran["n"]
    assert out[0] == {"ok": True, "value": "a"}, out
    assert out[1] == {"ok": False, "error": "nope"}, out
    assert out[2] == {"ok": True, "value": "b"}, out
    assert out[3] == {"ok": True, "value": "c"}, out


def test_all_succeed():
    async def ok(v):
        return v

    out = asyncio.run(run_all([ok(1), ok(2)]))
    assert out == [{"ok": True, "value": 1}, {"ok": True, "value": 2}], out


def test_runs_concurrently():
    # If run sequentially, the first coroutine would block the barrier forever.
    # A concurrent runner lets all three reach the barrier and release together.
    barrier = asyncio.Barrier(3) if hasattr(asyncio, "Barrier") else None

    async def worker(v):
        if barrier is not None:
            await barrier.wait()
        return v

    if barrier is None:
        return  # Barrier needs 3.11+; skip the concurrency assertion gracefully
    out = asyncio.run(run_all([worker(1), worker(2), worker(3)]))
    assert out == [
        {"ok": True, "value": 1},
        {"ok": True, "value": 2},
        {"ok": True, "value": 3},
    ], out


test_mix_success_and_failure()
test_one_raiser_does_not_sink_others()
test_all_succeed()
test_runs_concurrently()
print("ALL PASS")
