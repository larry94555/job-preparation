# Human-in-the-loop — expert context

## Human-in-the-loop patterns

Keeping a human on the important actions is a small, nameable family of patterns, and an expert reaches
for the right one rather than bolting a person onto everything.

- **Approval gates.** The action pauses and waits for an explicit human yes/no before an irreversible
  or expensive effect. This is the default for high-risk actions — a card charge, a data deletion, a
  public post — and the pattern the exercises in this topic implement.
- **Escalation.** The agent handles what it is confident about and hands *only* the hard or ambiguous
  cases to a human. Most traffic runs autonomously; the human's attention is spent where it is worth
  spending, not on every routine call.
- **Confidence thresholds / ask-when-unsure.** Instead of gating by a fixed action list, the agent gates
  by its own **calibrated confidence**: act when it is sure, ask when it is not. Done well this needs
  *calibrated* uncertainty — a model that is 95% confident should be right 95% of the time — which is
  why over-confident models make this pattern dangerous.

```python
def decide(action, confidence):
    if assess_risk(action) == "high":
        return "ask"                      # always gate the irreversible
    if confidence < 0.7:
        return "ask"                      # unsure → escalate to a human
    return "act"                          # confident and low-stakes → proceed
```

The shared principle is **oversight proportional to stakes**: the more an action can hurt, and the less
sure the agent is, the more a human belongs in the loop. This is the same trust gradient that
[agent-guardrails-budgets](../agent-guardrails-budgets/) applies to spend and that
[safety-engineering](../safety-engineering/) applies to unsafe content. Historically this is the
oversight side of the RLHF lineage — humans shaping the model in training, and humans supervising the
agent at *runtime* — and modern agent frameworks bake it in as first-class **interrupts** (e.g.
LangGraph pausing a graph to wait for human input, then resuming). Knowing which pattern fits which
action, and that ask-when-unsure requires calibration to be safe, is what reads as senior.
