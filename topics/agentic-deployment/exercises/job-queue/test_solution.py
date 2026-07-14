"""Tests for JobQueue. Run: python test_solution.py"""

import asyncio

from solution import JobQueue


def test_submit_stores_a_queued_job():
    q = JobQueue()
    job_id = q.submit({"n": 1})
    assert isinstance(job_id, str) and job_id, job_id
    job = q.status(job_id)
    assert job["status"] == "queued", job
    assert job["result"] is None, job


def test_run_next_completes_with_worker_result():
    q = JobQueue()

    async def worker(task):
        return task["n"] * 2

    job_id = q.submit({"n": 21})
    asyncio.run(q.run_next(worker))
    job = q.status(job_id)
    assert job["status"] == "done", job
    assert job["result"] == 42, job


def test_worker_exception_marks_failed_and_does_not_escape():
    q = JobQueue()

    async def boom(task):
        raise ValueError("worker exploded")

    job_id = q.submit({"n": 1})
    asyncio.run(q.run_next(boom))   # must NOT raise
    job = q.status(job_id)
    assert job["status"] == "failed", job
    assert "worker exploded" in str(job["error"]), job


def test_run_next_pops_oldest_queued_first():
    q = JobQueue()
    seen = []

    async def worker(task):
        seen.append(task)
        return task

    first = q.submit("a")
    second = q.submit("b")
    asyncio.run(q.run_next(worker))
    assert q.status(first)["status"] == "done", "oldest job runs first"
    assert q.status(second)["status"] == "queued", "second job still queued"
    asyncio.run(q.run_next(worker))
    assert q.status(second)["status"] == "done"
    assert seen == ["a", "b"], seen


def test_run_next_with_empty_queue_is_a_noop():
    q = JobQueue()
    asyncio.run(q.run_next(lambda t: t))  # no queued jobs — must not raise


test_submit_stores_a_queued_job()
test_run_next_completes_with_worker_result()
test_worker_exception_marks_failed_and_does_not_escape()
test_run_next_pops_oldest_queued_first()
test_run_next_with_empty_queue_is_a_noop()
print("ALL PASS")
