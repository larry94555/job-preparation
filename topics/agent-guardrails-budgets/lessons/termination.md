# Agent guardrails — termination

## Why agents need budgets and termination

A plain LLM call is bounded: you send a prompt, you get one response, it stops. An **agent** is
different — it runs a loop, choosing its own next action (think, call a tool, read the result, repeat)
until *something* decides it's done. Nothing about that loop stops on its own. If the agent misjudges
the task, hits a dead end, or gets caught cycling, it will keep spending **steps, tokens, and money**
with no natural stopping point.

So every agent runner needs two things baked in:

- **Budgets** — hard caps that bound the run no matter what the agent decides.
- **Termination conditions** — the explicit rules for when the loop stops.

The classic **antipattern** is the open-ended loop with a **success-only exit**: "stop when the task is
solved." If the agent can never reach success, it never stops. A correct runner must also stop on
**failure**, on **no progress**, and on **budget exhaustion**.

## Termination conditions and progress detection

A robust loop terminates on any of:

1. **Success** — the goal is met.
2. **Failure / no progress** — the agent is stuck.
3. **Budget exhausted** — a step, tool, token, cost, or wall-clock cap was hit.

The hard one is detecting **no progress**. The practical signal is **repetition**: the agent repeats
the same action, or revisits the same state, without changing anything in the environment or its plan.
This is often called **oscillation** or a **no-progress** loop. Tracking recent actions/states and
tripping when they repeat lets the runner break the loop early — instead of waiting for a budget to
drain.

When a run does stop — especially on an exhausted budget — it should stop **gracefully**. Graceful
termination returns the **best partial result** and the agent's **state**, so the work can be
inspected, resumed, or escalated to a human. Crashing, or silently dropping everything the agent did,
throws away real work and hides what went wrong.
