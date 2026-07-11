# Harness engineering — the frontier and operating it in production

The deep-dive gave you the levers — boundary placement, loop control, verification, tool contracts,
orchestration. This lesson drills the two things that separate someone who *knows* harness engineering
from someone who *runs* it at the frontier: where the research edge actually is, and the signals you
watch once an agent is live.

## The harness-engineering frontier

Three lines are where the field is genuinely moving, and an expert can name what each one is really
attacking.

- **Agentic-coding benchmarks (SWE-bench-style).** The benchmark frontier for long-horizon, *verifiable*
  agent work: resolve a real GitHub issue such that the project's own test suite goes green. The
  load-bearing lesson from these harnesses is that they win or lose on **verification** — running the
  tests, reading the `git diff`, re-running the build — far more than on raw model capability. The
  distinguishing move of a strong harness here is a deterministic gate on a *real* success signal
  (tests pass), which is why "eval-gated claims, not leaderboard theater" is the correct lens. A
  harness that trusts the model's "I fixed it" without executing the suite is not at the frontier no
  matter how capable the base model is.

- **Reliable long-horizon autonomy.** Keeping an agent on task over many steps is an open problem, not
  a solved one. As the loop lengthens, context accumulates, small errors compound, and the agent drifts
  or gets stuck. The frontier work is on structure that survives length — plan-then-execute so each step
  is independently checkable and re-plannable, self-reflection/retry (Reflexion, Shinn et al., 2023) so
  a failed attempt is critiqued rather than repeated, and robust **error recovery** that turns a failure
  into a next action instead of a crash or a spin. The mental model to carry: length is the enemy, and
  reliability at length comes from harness structure, not a longer prompt.

- **Verifying open-ended tasks.** The hardest open problem is tasks with **no crisp success check**.
  "Fix this test" has a deterministic gate; "improve this design doc" or "research this question" does
  not. The frontier is building trustworthy verification where the ground truth is soft — proxy checks,
  rubric-graded self-review, human-in-the-loop escalation — without pretending a soft check is a hard
  one. An expert flags exactly this: the harness pattern that works on SWE-bench (deterministic gate)
  does not transfer to open-ended work, and the honest move is to say so.

The reason to track this line specifically: all three attack the same weakness from different angles —
**an agent's reliability degrades as tasks get longer and success gets fuzzier.** Benchmarks pressure-test
it, long-horizon structure fights the length, and open-ended verification fights the fuzziness.

## Operating harness engineering in production

When an agent is live, you don't watch "harness" — you watch a handful of signals that tell you whether
the loop is healthy and where it's failing.

- **Steps (turns) per task, and its trend.** Cost and latency scale with loop length, so this is the
  headline gauge. A creeping average steps/task silently inflates the bill and tail latency and is the
  first sign tasks are getting harder or the agent is thrashing.
- **Stop-reason distribution.** Every run should end for a reason — completed, budget-exhausted,
  duplicate-call guard, no-progress. A healthy fleet is dominated by *completed*; a rising
  **budget-exhaustion rate** is the leading indicator that budgets are too tight or tasks too hard, and
  a rising duplicate-call / no-progress share means the agent is getting **stuck** rather than finishing.
- **Tool-error rate and retry rate.** How often tool calls fail (bad arguments, hallucinated tool names,
  timeouts) and how often the harness retries. Rising tool-error rate points at a tool-contract or
  argument-validation gap, not at the model — it's a structural signal.
- **Verification-failure rate.** How often the deterministic post-action check (tests / diff / run)
  rejects the model's claimed success. This is the signal that separates "looks done" from "is done";
  a high rate means the model is confidently wrong and the gate is earning its keep.
- **Loop / stuck detection.** The share of runs the no-progress guard catches. This is your runaway-cost
  early warning — an unbounded loop's context growth is what turns a stuck agent into a runaway bill,
  so catching "stuck" before the budget cap fires is the operational discipline.

The discipline: alert on **budget-exhaustion and stuck/no-progress rate** (leading indicators of runaway
cost), watch **verification-failure and tool-error rate** to tell a model problem from a harness problem,
and never reason about an agent fleet in "requests" when the real currency is **steps and tokens per task.**
