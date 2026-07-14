"""Reference solution: retry with exponential backoff (injected sleep)."""


async def retry_call(fn, attempts, sleep):
    for i in range(attempts):
        try:
            return await fn()
        except Exception:
            if i == attempts - 1:
                raise
            await sleep(2 ** i)
