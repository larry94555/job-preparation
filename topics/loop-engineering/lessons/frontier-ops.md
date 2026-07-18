# Loop engineering — the frontier and operating it in production

The deep-dive gave you the design levers and the review checklist. This lesson drills the two things
that separate someone who **knows** loop engineering from someone who **runs** it at the frontier: where
the research edge actually is, and the signals you watch once a loop is live.

## The loop-engineering frontier

Three lines are where the field is genuinely moving, and they all attack the same weakness — a loop's
reliability degrades as tasks get **longer** and success gets **fuzzier**.

- **Reliable long-horizon autonomy.** Keeping a loop on task over many steps is an open problem, not a
  solved one. As the loop lengthens, context accumulates, small errors compound, and the agent drifts
  or gets stuck. The mental model to carry: **length is the enemy**, and reliability at length comes
  from **harness structure** — plan-then-execute so each step is independently checkable, reflect-and-retry
  so a failed attempt is critiqued not repeated, deliberate compaction so the loop stays legible, and
  robust recovery that turns a failure into a next action — not from a longer prompt.

- **Agentic-coding benchmarks (SWE-bench-style).** The benchmark frontier for long-horizon, **verifiable**
  loop work: resolve a real issue until the project's own test suite goes green. The load-bearing lesson
  from these harnesses is that they win or lose on **verification** — running the tests and reading the
  `git diff` to gate on a real success signal — far more than on raw model capability. A loop that
  trusts "I fixed it" without executing the suite is not at the frontier no matter how strong the base
  model.

- **Verifying open-ended tasks.** The hardest open problem is tasks with **no crisp success check**.
  "Fix this failing test" has a deterministic gate; "improve this design doc" does not. The frontier is
  building trustworthy verification where the ground truth is soft — proxy checks, rubric-graded review,
  human-in-the-loop — without pretending a soft check is a hard one. The edit → run → observe gate that
  works on code does **not** transfer to open-ended work, and an expert says so rather than faking a gate.

## Operating a loop in production

When a loop is live, you don't watch "the loop" — you watch a handful of signals that say whether it is
converging and where it is failing.

- **Steps (turns) per task, and its trend.** Cost and latency scale with loop length, so this is the
  headline gauge. A creeping average steps/task silently inflates the bill and tail latency and is the
  first sign tasks are getting harder or the loop is thrashing.
- **Stop-reason distribution.** Every run should end for a reason — done, budget, no-progress. A healthy
  fleet is dominated by **done**; a rising **budget-exhaustion** share is the leading indicator that
  budgets are too tight or tasks too hard, and a rising **no-progress** share means loops are getting
  **stuck** rather than finishing.
- **No-progress / stuck rate.** The share of runs the no-progress guard catches is your runaway-cost
  early warning — catching "stuck" before the budget cap fires is the operational discipline that keeps
  a long loop from becoming a runaway bill.
- **Verification-failure rate.** How often the deterministic step-check rejects the loop's claimed
  success. A high rate means the model is confidently wrong and the gate is earning its keep — the
  signal that separates "looks done" from "is done."

The discipline: alert on **budget-exhaustion and no-progress rate** (the runaway-cost leading
indicators), read **verification-failure rate** to know how often the loop was about to drift, and never
reason about a loop fleet in "requests" when the real currency is **steps and tokens per task**.
