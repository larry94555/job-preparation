# Multi-agent orchestration — failure modes

## Where multi-agent systems break

Multi-agent systems fail in ways single agents don't, and the worst failure is the **silent bad
output**. One agent produces a result that *looks* fine — well-formed, plausible, confidently worded —
but is wrong. With no validation at the handoff, it is passed to the next agent, which builds on it, and
the error compounds through the pipeline. Every agent reports success; the system as a whole is wrong.

Silent bad outputs are dangerous precisely because nothing throws. A crash is easy to find; a plausible
lie handed between agents is not. The defense is the previous lesson's discipline — **validate** every
handoff — plus a **critic**: an agent whose one job is to review another agent's output and reject it
when it is bad, before it flows on.

```python
review = critic(content)          # {"approved": bool, "issues": [...]}
if not review["approved"]:
    content = writer(research, review["issues"])   # revise, don't ship the bad draft
```

## Approval loops need an exit

A critic that can reject creates a new hazard: the **approval loop**. The writer drafts, the critic
reviews, the writer revises, the critic reviews again — and if the critic *never* approves, the loop
runs forever, burning tokens and money with no result. An approval loop with no exit is one of the
classic ways a multi-agent system quietly falls apart.

Every approval loop needs a bounded **exit**: a `max_tries` limit after which you stop and return the
best draft so far, marked as unapproved. A terminating loop that gives up gracefully beats an infinite
one that never does.

```python
def revise_until_approved(draft, critic, revise, max_tries=3):
    for n in range(1, max_tries + 1):
        r = critic(draft)
        if r["approved"]:
            return {"content": draft, "approved": True, "tries": n}
        draft = revise(draft, r["issues"])
    return {"content": draft, "approved": False, "tries": max_tries}   # bounded exit
```

The pattern generalizes: any loop driven by another agent's judgment must be capped, exactly as a
single agent's tool loop is capped and budgeted — see
[agent-guardrails-budgets](../agent-guardrails-budgets/) — and any critic should be graded like any
other evaluator, see [eval-methodology](../eval-methodology/).
