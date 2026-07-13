"""Reference solution: a token-bucket rate limiter (injected clock)."""


class TokenBucket:
    def __init__(self, capacity, refill_per_sec):
        self.capacity = capacity
        self.refill_per_sec = refill_per_sec
        self.tokens = float(capacity)   # start full
        self.last = None

    def allow(self, now: float) -> bool:
        if self.last is not None:
            elapsed = now - self.last
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_per_sec)
        self.last = now
        if self.tokens >= 1.0:
            self.tokens -= 1.0
            return True
        return False
