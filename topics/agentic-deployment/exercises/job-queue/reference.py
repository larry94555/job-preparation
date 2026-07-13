"""Reference solution: an async job queue (submit -> background run -> poll)."""


class JobQueue:
    def __init__(self):
        self._jobs = {}          # job_id -> job record
        self._order = []         # ids in submission order (oldest first)
        self._counter = 0

    def submit(self, task) -> str:
        self._counter += 1
        job_id = f"job_{self._counter}"
        self._jobs[job_id] = {
            "id": job_id,
            "task": task,
            "status": "queued",
            "result": None,
            "error": None,
        }
        self._order.append(job_id)
        return job_id

    async def run_next(self, worker) -> None:
        # pop the oldest queued job
        job_id = None
        for jid in self._order:
            if self._jobs[jid]["status"] == "queued":
                job_id = jid
                break
        if job_id is None:
            return
        job = self._jobs[job_id]
        job["status"] = "running"
        try:
            job["result"] = await worker(job["task"])
            job["status"] = "done"
        except Exception as e:  # noqa: BLE001 — a failed job is a terminal state, not a crash
            job["error"] = str(e)
            job["status"] = "failed"

    def status(self, job_id: str) -> dict:
        return self._jobs[job_id]
