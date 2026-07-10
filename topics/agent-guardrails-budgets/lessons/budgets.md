# Agent guardrails — budgets

## The dimensions of an agent budget

A budget is not a single number. A stuck agent can burn resources along several independent axes, so a
runner caps each one, and **any cap being hit terminates the run**:

- **Steps / iterations** — the maximum number of loop turns. The coarsest and most important bound.
- **Tool calls** — a per-tool cap (e.g. at most N web searches) so one **expensive or rate-limited**
  tool can't be hammered in a loop even while the step budget still has room.
- **Tokens** — cumulative input + output tokens across the whole run.
- **Cost** — the dollar total, which tracks tokens and tool fees; this is the ceiling that protects the
  bill directly.
- **Wall-clock time** — total elapsed real time.

## Why wall-clock is its own budget

It's tempting to think step and token caps already bound how long a run takes. They don't. A **single
step can hang** — a slow tool, a stalled network call, a model request that takes far longer than
usual. Under a step budget the run is still "within bounds" while it sits frozen. A separate
**wall-clock timeout** is the only thing that bounds latency and rescues a run from a hung dependency.

## Budgets and graceful termination

Budgets are the enforcement arm of termination. Each budget is a termination condition: when it trips,
the runner stops. The **antipattern** is having **no cost ceiling** — an open-ended loop with no dollar
or time cap is one bad plan away from a runaway bill.

And, as with any termination, hitting a budget should **degrade gracefully**: return the best partial
result and the agent's state rather than crashing. A budget-exhausted run that hands back partial work
plus a clear "stopped: step budget exhausted" is far more useful than one that simply dies.
