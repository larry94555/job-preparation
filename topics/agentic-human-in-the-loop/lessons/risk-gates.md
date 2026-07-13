# Human-in-the-loop — gating the irreversible actions

## Gate the irreversible actions

Once actions are classified, the gate is simple to state: a **high-risk action does not run until a
human approves it**. Low- and medium-risk actions execute directly; a high-risk action pauses, asks a
person, and only proceeds on an explicit yes. This is an **approval gate** — the seam between the
agent's intent and the world's state, with a human standing in it for exactly the actions that can't be
taken back.

```python
def execute_with_approval(action, params, approve, execute, audit):
    risk = assess_risk(action)
    if risk == "high":
        if not approve(action, params):        # human says no
            audit.append({"action": action, "risk": risk, "decision": "rejected"})
            return {"status": "rejected"}      # execute is NEVER called
    audit.append({"action": action, "risk": risk, "decision": "executed"})
    return {"status": "executed", "result": execute(action, params)}
```

Two properties make this a *gate* and not just a log line. First, on rejection `execute` is **never
called** — the irreversible thing simply does not happen. A gate that logs "rejected" and then runs the
action anyway is not a gate. Second, both branches leave an **audit** record behind, so whether the
human approved or rejected, there is a durable trace of the decision. The gate is what turns a
confidently-wrong high-risk call into a recoverable *pause* instead of a permanent mistake.

The `approve` callback is deliberately abstract: it might be a Slack button, a CLI prompt, a ticket a
reviewer clears, or an automated policy for a subset of actions. What matters is that the agent
**blocks** on it for high-risk actions and cannot route around it. This is the action-side twin of the
budget ceilings in [agent-guardrails-budgets](../agent-guardrails-budgets/): budgets cap how *much* an
agent can spend, and the approval gate caps *what irreversible things* it can do unsupervised. When the
agent is genuinely unsure whether an action is safe, escalating to a human is the correct behavior, not
a failure — the same instinct behind refusing rather than guessing in
[safety-engineering](../safety-engineering/).
