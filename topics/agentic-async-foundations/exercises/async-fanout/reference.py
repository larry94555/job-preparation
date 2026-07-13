"""Reference solution: fan out concurrent calls with asyncio.gather."""

import asyncio


async def gather_calls(client, queries) -> list:
    coros = [client.fetch(q) for q in queries]
    return await asyncio.gather(*coros)
