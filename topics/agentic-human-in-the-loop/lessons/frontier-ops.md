# Human-in-the-loop — the frontier

## The autonomy spectrum

Risk gates, approval, audit, and clean resumption are the solid ground. The frontier is deciding
*where on the autonomy spectrum a given action should sit* — and getting an agent to make that call for
itself. Autonomy is not a binary of "human approves everything" versus "agent does everything." It is a
**spectrum**: fully manual, human-approves-each-action, human-approves-high-risk-only,
agent-acts-but-can-be-interrupted, fully autonomous. The engineering question is which rung each action
belongs on, and the frontier question is whether the agent can place itself on the right rung.

- **Calibrated confidence is the hard part.** "Ask when unsure" only works if the agent's sense of
  *unsure* is trustworthy. An over-confident model that is 95% sure but 70% right will barrel past the
  gate on exactly the actions it should have escalated. Getting an agent's stated confidence to match
  its real accuracy — calibration — is an open problem, and it is what makes autonomy-by-confidence
  safe or dangerous.
- **The moving line.** As models get more reliable, the economically correct amount of human oversight
  drops — actions that needed approval last year can run unattended this year. But the line moves *per
  action and per stakes*, not uniformly: the cost of a wrong `charge_payment` doesn't fall just because
  the model improved. An expert re-draws the line deliberately, action by action, rather than turning
  the whole agent loose at once.

```python
def autonomy_level(action, confidence):
    if assess_risk(action) == "high":
        return "human_approves"           # irreversible → gate regardless of confidence
    if confidence < 0.7:
        return "human_approves"           # uncalibrated-or-unsure → escalate
    return "autonomous"                   # low-stakes and confident → let it run
```

The reason to track this frontier: it is the same trust gradient the whole topic is built on — the
model is an untrusted actor — pushed to the point where the agent is deciding *its own* level of
oversight. An expert can say which actions are safe to move toward autonomy, insists that calibration
be *measured* before confidence is trusted, and never claims the human can be removed from the
irreversible actions. It is the runtime-oversight sibling of the guardrail reasoning in
[agent-guardrails-budgets](../agent-guardrails-budgets/) and [safety-engineering](../safety-engineering/).
