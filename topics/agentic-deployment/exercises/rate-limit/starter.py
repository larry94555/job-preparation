"""Implement a token-bucket rate limiter.

TokenBucket(capacity, refill_per_sec):
  - allow(now: float) -> bool
        `now` is an injected monotonic time in seconds. On each call:
          1. refill tokens for the time elapsed since the previous call
             (elapsed * refill_per_sec), capped at `capacity`;
          2. if at least one token is available, consume one and return True;
          3. otherwise return False.
        The FIRST call has no previous time to refill from — the bucket simply
        starts full (`capacity` tokens).

Determinism: `now` is injected, so no call reads a real clock. A burst of
`capacity` calls at the same `now` allows then denies; advancing `now` enough
refills and re-allows.
"""


class TokenBucket:
    def __init__(self, capacity, refill_per_sec):
        raise NotImplementedError

    def allow(self, now: float) -> bool:
        raise NotImplementedError
