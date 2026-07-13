# Single-agent workflows — validate tool outputs

## Validate tool outputs before feeding back

The Observe step feeds a tool's output back into the loop as an observation — and that output is not
always usable. A tool can return `None`, an empty string, an empty dict, or malformed data. If the loop
feeds that straight back, the agent reasons over garbage on its next turn, and a single bad observation
derails everything after it. The fourth guardrail is to **validate the observation before it re-enters
the loop**.

Validation here is a boundary check: an observation is usable if it carries real content — a non-empty
string or a non-empty structure — and is *not* usable if it is empty or missing. Reject the bad ones at
the seam, before they reach the agent's next Thought.

```python
def validate_observation(obs):
    if isinstance(obs, dict) and obs:
        return {"ok": True, "value": obs}
    if isinstance(obs, str) and obs:
        return {"ok": True, "value": obs}
    return {"ok": False, "error": "empty_observation"}   # reject before feeding back
```

When validation fails, the loop does not feed the empty observation back as if it were a result. It
records the rejection (that is what the per-step log is for) and can retry the tool or surface the
failure — but it never lets the agent reason as though a broken call succeeded. Validating outputs is
the same discipline as validating tool *inputs*, applied on the way back: the agent is an untrusted
consumer of tool results just as the tool is an untrusted consumer of the agent's arguments.

Cross-links: [harness-engineering](../../harness-engineering/) runs the tool and applies this check;
[agent-guardrails-budgets](../../agent-guardrails-budgets/) covers the budget you spend retrying a tool
whose output failed validation.
