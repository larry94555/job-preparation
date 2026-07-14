"""Implement an async job queue (submit -> background run -> poll).

JobQueue:
  - submit(task) -> job_id
        store a new job with status "queued" and return its id (a fast write;
        do NOT run the task here).
  - async run_next(worker) -> None
        pop the OLDEST queued job, mark it "running", then `result = await
        worker(task)`. On success set status "done" with the result. If the
        worker raises, set status "failed" with str(error) — do NOT let the
        exception escape.
  - status(job_id) -> dict
        return the job's current record (its status and result/error).

Determinism: drive it with asyncio.run and a stub async worker; nothing reads a
real clock or does real I/O.
"""


class JobQueue:
    def submit(self, task) -> str:
        raise NotImplementedError

    async def run_next(self, worker) -> None:
        raise NotImplementedError

    def status(self, job_id: str) -> dict:
        raise NotImplementedError
