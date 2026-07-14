# Single-agent workflows — the ReAct step format

## Reading a ReAct step

The loop is only as reliable as the harness's ability to tell an *action* step from a *final* step, and
that comes down to the **format** the agent emits. The classic ReAct shape is line-structured on
purpose:

```
Thought: I need the current price, so I'll look it up.
Action: get_price
Action Input: {"ticker": "ACME"}
Observation: 41.20
```

Each part sits on its own labeled line so the harness can parse it deterministically: pull the
**Thought** (the written reasoning), the **Action** (the tool name), and the **Action Input** (its
argument). The observation is not something the model writes — the harness runs the tool and appends the
real result on the `Observation:` line before the next Thought.

A **final** step is the same format with the Action lines *absent*: a thought-only step, no `Action`
line, is the model saying "I can answer now." That presence-or-absence of the Action line is exactly the
signal the parser turns into the step **kind** — `action` when an Action line is present, `final` when it
is not. This is why the format matters: it is what makes each step machine-routable, so the harness knows
whether to run a tool and loop or to return and stop. It is also why a ReAct agent beats one-shot
answering: the structured Thought → Action → Observation cycle lets it fetch real information and reason
over what actually came back, instead of committing to an answer from the prompt alone.

## Why the format grounds the loop

The reason the format is built around a real `Observation:` line is grounding. After the agent acts, the
harness feeds back the tool's *genuine* result — even when that result is an error string or an empty
answer. The next Thought reasons over what really happened, not over what the model imagined would
happen.

The failure this prevents is a hallucinated observation. If the loop let the model assume its action
succeeded and narrate a made-up result, one imagined observation would poison every step after it, and
the agent would drift with no signal that anything went wrong. Feeding back the true result — including a
failure — keeps the agent honest: it can retry, pick a different action, or give up cleanly, because its
next decision is anchored to the real tool outcome.

That grounded, structured cycle is also what makes the loop **adaptive**. Because each turn's next action
is chosen from the newest observation rather than from a fixed script, an easy task finishes in a couple
of steps and a hard one runs longer. The step kind — read straight off whether an Action line is present
— is the whole control signal that decides *continue* versus *stop*.

See [harness-engineering](../../harness-engineering/) for the parser that reads this format, and
[agent-guardrails-budgets](../../agent-guardrails-budgets/) for the budgets that bound how many times the
cycle repeats.
