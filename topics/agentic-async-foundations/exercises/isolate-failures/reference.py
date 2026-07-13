"""Reference solution: isolate failures in a concurrent fan-out."""

import asyncio


async def run_all(coros) -> list:
    raw = await asyncio.gather(*coros, return_exceptions=True)
    results = []
    for r in raw:
        if isinstance(r, Exception):
            results.append({"ok": False, "error": str(r)})
        else:
            results.append({"ok": True, "value": r})
    return results
