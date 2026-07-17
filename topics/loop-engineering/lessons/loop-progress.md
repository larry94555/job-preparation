# Loop engineering — progress, convergence and recovery

## Measurable progress

A loop that keeps taking actions is not automatically getting anywhere. **Measurable progress** means
each iteration moves a concrete, **checkable** signal toward the goal: a failing test now passes, a
subtask is verified complete, the error count drops, a required file now exists. "The agent took
another action" is not progress — activity is not achievement.

This is why progress and verification are joined at the hip. Unverified "progress" can be a false
belief: the agent believes it advanced because it *did* something, while the real signal hasn't moved.
So a well-engineered loop **gates the next step on a checked result** — it advances only when
verification confirms the signal moved, and treats an unverified step as not-yet-done rather than done.

## Detecting no-progress and oscillation

Because progress is measurable, its absence is detectable — and that detection is what saves a loop
from spinning.

**No-progress** shows up as repetition without change: the same tool call with the same arguments, the
same error returning, the same state observed turn after turn. When the observable result stops moving,
the loop is stuck, and the harness should intervene — break the cycle, re-plan, or stop with a
`no-progress` reason — rather than keep paying for identical turns.

**Oscillation** is a subtler stuck pattern: the agent flips between two states, undoing and redoing the
same change, each turn "fixing" what the last turn broke. Net progress is zero even though every
individual step looks busy. Detecting oscillation means noticing the loop is cycling through a small set
of states rather than reducing the remaining work.

## Recovery: turning failure into a next action

Failures are normal inside a loop; the question is what the loop does with one. **Recovery** means
turning a failure into the **next action** — retry, re-plan, or escalate — instead of crashing or
blindly repeating.

The reason a blind retry is not recovery: a **permanent** failure (a bad argument, a missing
capability, a genuinely wrong plan) fails identically every time, so retrying just repeats it and burns
the budget. Real recovery **classifies** the failure first — is it transient (retry), or does the
approach need to change (re-plan), or is it beyond the agent (escalate to a human or a stronger model)?
A loop that only knows how to retry will thrash on exactly the failures a retry can't fix.

## Context growth and compaction

Length is the enemy. The longer a loop runs, the more observations accumulate, and that growing context
becomes a failure mode of its own: it inflates cost (every past turn is re-sent and re-billed) and
buries the signal the next decision needs under stale detail.

**Compaction** is the remedy — summarizing or dropping stale observations so the loop keeps what it
needs without carrying everything. A long-horizon loop that never compacts eventually spends most of its
budget re-reading its own history and loses the thread; one that compacts deliberately can run for many
steps and still keep a clear working state.

**Why this matters.** Progress detection, recovery, and compaction are what separate a loop that
**converges** — steadily reducing the remaining work until the goal is verified — from one that
**thrashes**: busy, expensive, and no closer to done. Engineering the loop to make real progress, notice
when it isn't, recover deliberately, and stay legible over length is what makes long autonomous runs
actually finish.
