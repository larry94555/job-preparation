"""Isolate failures in a concurrent fan-out.

Implement run_all(coros):
  - run all the given coroutines CONCURRENTLY
  - return a list of result dicts, IN ORDER:
      {"ok": True,  "value": v}       for a coroutine that returns v
      {"ok": False, "error": str(e)}  for a coroutine that raises e
  - a coroutine that raises must NOT abort the others; isolate each failure
    (e.g. asyncio.gather(..., return_exceptions=True), or per-task try/except)
"""


async def run_all(coros) -> list:
    raise NotImplementedError
