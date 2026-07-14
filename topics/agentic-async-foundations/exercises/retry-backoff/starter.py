"""Retry a flaky async call with exponential backoff.

Implement retry_call(fn, attempts, sleep):
  - await fn() and return its value
  - if fn() raises, await sleep(delay) and retry, up to `attempts` total tries
  - use EXPONENTIAL delay between tries: 1, 2, 4, ... (i.e. 2 ** try_index)
  - if the last attempt still raises, re-raise that exception

`sleep` is an injected async function (async def sleep(delay): ...) so tests can
record the delays without waiting for real time. Do NOT import time or call
asyncio.sleep directly — always await the injected `sleep`.
"""


async def retry_call(fn, attempts, sleep):
    raise NotImplementedError
