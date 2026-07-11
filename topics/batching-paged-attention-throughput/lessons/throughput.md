# Throughput, latency & goodput

## The throughput vs latency tradeoff

Continuous batching and paged attention let you run a larger **running batch**. Bigger batches are good
for **throughput** — aggregate tokens per second — because the fixed cost of loading model weights is
amortized across more requests and the GPU stays busy.

But throughput is not the only thing users feel. Two latency metrics matter per request:

- **TTFT** (time-to-first-token) — how long until the response starts.
- **TPOT** (time-per-output-token) — the gap between streamed tokens.

As batch size climbs, each request shares the GPU with more peers, so **TPOT** and **tail/p95 latency**
tend to **rise**. That is the fundamental tension: raising batch size trades per-request latency for
aggregate throughput. You cannot maximize both at once; more utilization means more contention.

## Goodput under an SLO

Raw throughput counts **all** completed work, regardless of how slow it was. That is misleading when you
have a **latency SLO** (e.g. "p95 TPOT under 50 ms"). A request that completes but violates its SLO is,
from the user's perspective, a failure.

**Goodput** is the metric that captures this: the rate of requests (or tokens) completed **while still
meeting their SLO**. It is the number to optimize when serving under latency targets.

The practical consequence: push batch size up only until **goodput** stops improving. Beyond that point,
extra raw throughput comes from requests that miss their SLO — the throughput number keeps climbing
while goodput falls. The right operating point maximizes goodput, not raw throughput. SLO-aware
schedulers use exactly this signal to decide how aggressively to batch.
