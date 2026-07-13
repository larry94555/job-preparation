# Python & async foundations — resilient calls

## Calls fail retry them safely

Every call an agent makes crosses a network to a service that will, eventually, misbehave: a model
endpoint returns a transient `503`, a tool times out, a connection resets. These failures are *expected
input*, not exceptional events, and a resilient agent plans for them instead of crashing on the first
one.

The first line of defense is a **timeout**. An unbounded `await` will wait forever if the other side
hangs, silently freezing the agent. Wrapping the call bounds that wait and turns a hang into a normal,
catchable error:

```python
try:
    resp = await asyncio.wait_for(client.fetch(q), timeout=10)
except asyncio.TimeoutError:
    ...   # now it's an error you can retry, not a permanent stall
```

The second line is a **bounded retry**. Because many failures are transient, retrying often succeeds —
but the retry must be *bounded* (give up after N attempts) so a genuinely-down service doesn't trap you
in an infinite loop. Retry forever and you've replaced one hang with another; don't retry at all and you
fail on noise that a second attempt would have cleared.

## Backoff and jitter

*How* you space retries matters as much as *whether* you retry. Retrying instantly, or on a tight fixed
interval, is the worst thing you can do to a service that is failing because it is *overloaded* — you
pile on more load at the exact moment it needs relief. The fix is **exponential backoff**: grow the
delay between attempts (1s, 2s, 4s, 8s, …) so you back pressure off and give the service room to recover.

```python
async def retry_call(fn, attempts, sleep):
    for i in range(attempts):
        try:
            return await fn()
        except Exception:
            if i == attempts - 1:
                raise                       # last try: propagate
            await sleep(2 ** i)             # exponential: 1, 2, 4, ...
```

Exponential backoff alone has a subtle failure at scale: if many clients hit the same error and all back
off on the *same* schedule, they retry in lockstep — at second 2, then 4, then 8 — hammering the service
in synchronized waves. This is the **thundering herd**, and the fix is **jitter**: add randomness to each
delay (e.g. `2 ** i + random.uniform(0, 1)`) so clients spread out instead of retrying in unison.
Timeout, bounded exponential backoff, and jitter are the standard resilience trio for any remote call —
the same failure modes catalogued in [production-failure-modes](../../production-failure-modes/) and
handled by the [harness-engineering](../../harness-engineering/) around real agents.
