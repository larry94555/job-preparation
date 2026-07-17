# Loop engineering — loop shapes

## The default: a single bounded loop

The workhorse shape is a **single bounded loop**: one reasoning thread that thinks, acts, observes, and
repeats, wrapped in budgets and guards. It is the ReAct pattern with the loop-engineering additions
that make it safe — a step/tool/token/time budget, duplicate-call and no-progress detection, and
verification after mutating actions.

Reach for this first. It is simple to build, easy to debug (one linear trace), cheap (no coordination
overhead), and it verifiably finishes most real tasks. The guiding rule of the whole section is the
**most-constrained-shape rule**: use the simplest shape that does the job, and add structure only when
a simpler loop **demonstrably** fails on a real signal — not because a fancier shape sounds better.

## Structured shapes: plan-then-execute and reflect-retry

Two shapes add structure when a single loop struggles.

**Plan-then-execute** separates planning from doing. The agent first produces a plan of steps, then
executes them one at a time. The payoff is that each step becomes **independently checkable and
re-plannable**: you can inspect the plan before any side effects, verify each step as it runs, and
re-plan from the point of failure instead of discovering at the end that step two was wrong. The cost
is extra planning latency and orchestration code. Reach for it on multi-step tasks where steps can fail
and recover.

**Reflect-and-retry** (the Reflexion pattern) adds a critique between attempts. Instead of blindly
re-running a failed action, the agent **reflects** on why the attempt failed and revises its approach
before trying again. The distinction from a plain retry is the whole point: a plain retry repeats the
same action and often the same failure; reflection changes the approach. It costs an extra reasoning
turn per retry and only helps when a failure is actually *informative* — when there's something to
learn from what went wrong.

## The coding loop, and choosing a shape

The shape behind coding agents is the **edit → run → observe** loop: propose an edit, run the project's
tests or build, read the result, and let that result decide the next edit. Its load-bearing step is the
**run** — executing the tests is a deterministic success signal that gates the next edit. A coding loop
that edits without running is guessing; the test result is what turns "I think this fixes it" into a
checked fact, and it is exactly why SWE-bench-style harnesses win or lose on verification rather than
raw model strength.

**Search loops** (tree or graph) explore multiple branches and score them. They are genuinely more
powerful when a task has several viable paths worth pursuing in parallel *and* you have a way to score
partial progress — but they multiply model calls and add coordination surface, so they are the wrong
reflex for a task a single loop would close.

**Choosing** comes back to the most-constrained-shape rule and an **escalation** policy: start with the
single bounded loop; escalate to plan-then-execute or reflect-retry only when the simple loop fails on a
real signal (repeated failures, no progress, a plan that clearly needs checkpointing); reserve search
for the rare task that truly branches. The senior move is naming *why* a shape is warranted, not
reaching for the most elaborate one available.
