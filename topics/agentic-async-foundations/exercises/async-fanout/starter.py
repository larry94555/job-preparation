"""Fan out concurrent calls with asyncio.

Implement gather_calls(client, queries):
  - client.fetch(q) is an async method (a coroutine); await it for each query
  - run ALL the fetches CONCURRENTLY (asyncio.gather), not one after another
  - return the results as a list, in the SAME ORDER as `queries`

A sequential loop that awaits each fetch before starting the next is wrong —
the whole point is to overlap the waits.
"""


async def gather_calls(client, queries) -> list:
    raise NotImplementedError
