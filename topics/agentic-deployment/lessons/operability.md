# Production deployment — operability

## Rate limit every user

Once the agent is a service, every user shares one pool of workers and one model budget. Without a
limit, a single caller — a buggy client in a retry loop, or a bad actor — can submit thousands of jobs,
drain the worker pool, and run up your token bill while everyone else waits. **Rate limit every user**
is not optional hardening; it is what keeps one tenant from becoming everyone's outage. It is the
enforcement half of [multi-tenant isolation](../multi-tenant-isolation/): fairness has to be *measured
and enforced* per user, not hoped for.

The standard mechanism is a **token bucket**. Each user has a bucket that holds up to `capacity` tokens
and refills at a steady `refill_per_sec`. Every request tries to take one token: if the bucket has one,
the request is **allowed** and a token is consumed; if it is empty, the request is **denied** (rejected
or made to wait). The bucket is what turns "be fair" into a concrete, checkable rule.

```python
class TokenBucket:
    def __init__(self, capacity, refill_per_sec):
        self.capacity = capacity
        self.refill_per_sec = refill_per_sec
        self.tokens = float(capacity)
        self.last = None

    def allow(self, now: float) -> bool:
        if self.last is not None:                       # refill for elapsed time
            self.tokens = min(self.capacity,
                              self.tokens + (now - self.last) * self.refill_per_sec)
        self.last = now
        if self.tokens >= 1.0:
            self.tokens -= 1.0                           # consume one, allow
            return True
        return False                                     # empty, deny
```

The bucket has a nice property: it **allows short bursts** (up to `capacity` back-to-back) but enforces a
steady **average rate** over time (`refill_per_sec`). That matches real traffic — a user can fire a
handful of requests at once, then is throttled to the sustainable rate. Note the injected `now`: the
bucket refills from *elapsed time*, so passing the clock in (rather than reading it inside) makes the
limiter deterministic and testable — the same discipline the [job queue](../lesson-jobs) exercise uses
by injecting the worker. You will implement this exact bucket in the exercise.
