# Production deployment — safe rollout

## Canary then rollback

A new version of an agent — a new prompt, a new model, a new tool — can be worse in ways your tests
never caught: a subtly wrong output, a regression that only shows under real traffic. Shipping it to
100% of users at once means a bad change hits everyone at once. The safe pattern is **canary then
rollback**: release the new version to a small slice of traffic first, watch it, and either widen the
rollout or pull it back.

A **canary** routes a fraction of users to the new version while everyone else stays on the stable one.
The routing must be **deterministic and sticky** — a given user always lands on the same side — so you
use a stable hash of the user id, not a coin flip, to decide. That way a user doesn't flip between
versions on every request, and you can grow the canary from 5% to 50% to 100% by turning one dial.

```python
def hash_to_100(user_id: str) -> int:
    return sum(user_id.encode()) % 100          # stable across processes, unlike hash()

def route(user_id: str, canary_pct: int) -> str:
    return "canary" if hash_to_100(user_id) < canary_pct else "stable"
# canary_pct=0  → everyone "stable";  canary_pct=100 → everyone "canary"
```

Do **not** use Python's built-in `hash()` for the split — it is salted per process, so the same user
would route differently on different workers. A stable hash (here, sum of bytes mod 100) gives every
worker the same answer.

While the canary is live you **watch for errors** — error rate, latency, failed jobs on the new slice
versus the stable one, exactly the signals [production failure modes](../production-failure-modes/)
teaches you to instrument. If the canary's numbers are worse, you **rollback**: switch traffic back to
the last known-good version. A rollback must be **one command / one dial** (set `canary_pct` back to 0,
or repoint to the previous image) and fast, because it is what you reach for when the new version is on
fire. Rolling *forward* with a fix takes time you don't have mid-incident; rolling *back* to something
that already worked is instant. The whole loop — canary a slice, watch the errors, rollback on
regression — is what lets you deploy an agent often without deploying an outage often.
