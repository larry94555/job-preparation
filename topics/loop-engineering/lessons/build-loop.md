# Loop engineering — build it: a bounded loop with progress detection

## The loop skeleton

An agent loop in code is small: a loop that calls `step(i)`, counts the step, and decides whether to
stop. The skeleton is the four phases from Section 1 — observe the returned step, treat it as the
model's decision, inspect the resulting state (act and verify), then run the stop checks. Almost
everything hard about loop engineering lives in those **stop checks**: without them the skeleton is a
`while (true)` with an API key.

## Detecting no-progress from unchanged state

Because progress is **measurable**, its absence is detectable. Keep the previous iteration's observed
state and compare: if the new state equals the previous one, the loop is stuck — the same situation is
recurring — and it should stop with a `no-progress` reason instead of paying for identical turns. One
subtlety: the first iteration has no previous state, so the guard cannot fire on step 1; it needs at
least one prior observation to compare against.

## Named termination and precedence

A loop can satisfy more than one stop condition at once, so **precedence** matters. A verified `done`
beats everything, including the budget cap: if the goal is met on the very step that reaches
`maxSteps`, the honest report is `done`, not `budget` — the task actually succeeded. So check `done`
first, then `no-progress`, then the budget cap. And always return **why** it stopped: a bare step
count hides whether the run finished, ran out of budget, or got stuck, and that distinction is exactly
what an operator needs to read a fleet of runs.

Put together, a good bounded loop returns not just an answer but a `stoppedBy` reason — the difference
between an agent you can operate and a black box that either works or doesn't.
