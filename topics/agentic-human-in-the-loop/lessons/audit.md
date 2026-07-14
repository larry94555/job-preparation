# Human-in-the-loop — the audit trail

## Keep an audit trail

An approval gate decides *whether* an action runs; the **audit trail** records *what the agent did and
why*. Every consequential decision — the action, its parameters, the risk level, and whether it was
approved, rejected, or executed — gets appended to a durable, append-only log. Without it, a wrong
action is a mystery: you can see the damaged state but not the chain of reasoning and approvals that
produced it. With it, you can answer "who approved this charge, and on what basis?" after the fact.

```python
class AuditLog:
    def __init__(self):
        self._records = []

    def record(self, action, params, risk, decision):
        self._records.append(
            {"action": action, "params": params, "risk": risk, "decision": decision}
        )

    def query(self, action=None):
        if action is None:
            return list(self._records)
        return [r for r in self._records if r["action"] == action]
```

Two properties make an audit log trustworthy. It is **append-only** — you add records, you never
rewrite history — so the trace of what happened cannot be quietly edited after the fact. And it is
**queryable**: you can pull every `charge_payment` or every rejected action to review a pattern, not
just read a wall of text. Order matters too; records are kept in the sequence the decisions were made,
so the trail reconstructs the actual timeline.

The audit trail is the accountability layer that makes autonomy defensible. It is the per-action
equivalent of the request logging in [multi-tenant-isolation](../multi-tenant-isolation/), where every
tenant action must be attributable, and it feeds the same incident-review discipline as
[safety-engineering](../safety-engineering/): when something goes wrong, the log is how you find out
*what* happened, *who* approved it, and *why* — and how you fix the gate so it doesn't happen again.
