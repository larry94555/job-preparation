# Single-agent workflows — observe before you decide

## Observe before you decide

The two middle steps of the loop are where an agent stays honest. After it **acts** — calls a tool —
it must **observe** the *real* result before it reasons again. Observing means taking the actual tool
output and putting it back into the conversation, so the next Thought is grounded in what happened
rather than in what the model imagined would happen.

The failure mode this prevents is the agent narrating a result it never saw. If the loop lets the model
"assume" a tool returned success and move on, one hallucinated observation poisons every step after it.
Feeding back the genuine result — even when it is an error or an empty answer — keeps the agent tied to
reality.

```python
observation = tools[step.tool](step.tool_input)     # Act
messages.append({"role": "tool", "content": observation})   # Observe: the real result
next_step = client.step(messages)                   # Decide: reason again with it in hand
```

Only after observing does the agent **decide**. With the fresh observation, it judges whether it can
now answer: if yes, it emits a `final` and the loop ends; if not, it reasons and acts again. That
decision is what makes the loop adaptive — the agent is not running a fixed script, it is choosing, each
turn, between finishing and taking one more grounded step.

Cross-links: [harness-engineering](../../harness-engineering/) owns the observe step (it runs the tool
and appends the result), and [agent-guardrails-budgets](../../agent-guardrails-budgets/) covers what to
do when the decision is "keep going" one time too many.
