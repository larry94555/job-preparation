# Human-in-the-loop — tiering risk and designing the approval surface

You know the mechanism: classify each action by risk, gate the high-risk ones behind an approval, and
audit every decision. This lesson zooms out to the **design judgment** that sits on top of that
mechanism — *where the tier boundary should sit*, and *what an approval request has to look like* so the
human in the loop is real oversight and not a rubber stamp. This is the difference between a gate that
works in a demo and one that survives production volume.

## Where the tier boundary sits

Risk classification is a two-axis judgment: **reversibility first, cost second**. A read is low
(reversible, cheap); a create or update on state you own is medium (mutating but recoverable); a charge,
a deletion, or a public post is high (irreversible or expensive). Only the high tier is gated — and the
placement of that boundary is a deliberate tradeoff, not a detail.

```python
def assess_risk(action: str) -> str:
    if action.startswith(("delete", "send_email", "charge_payment", "post_public")):
        return "high"        # irreversible / expensive → gate it
    if action.startswith(("create", "update", "schedule")):
        return "medium"      # recoverable → runs directly
    return "low"             # reads → runs directly
```

Get the boundary **too coarse** and an irreversible action slips into a lower tier and runs ungated —
the exact failure the gate existed to prevent. Get it **too fine** — gate every write — and you drown
reviewers in low-stakes prompts. Cost matters here too: an action can be fully reversible yet spend
thousands of dollars on one call, and cost is the second axis that can still pull it up toward high. The
boundary is calibrated to keep the human's attention on the actions where a yes/no actually changes the
outcome. This is the same trust-gradient reasoning as
[agent-guardrails-budgets](../agent-guardrails-budgets/): the more an action can hurt, the more it has
to prove before it runs.

## Why over-gating breaks the gate

The instinct to "gate everything, just to be safe" is wrong, and it fails in a specific way. **Oversight
is not free**: every gate spends a human's attention and adds latency. Flood a reviewer with hundreds of
routine approvals and they **habituate** — they stop reading and start clicking yes. The gate that
matters, the one high-risk deletion buried in the noise, gets **rubber-stamped** along with everything
else. Over-gating doesn't add safety; it actively *weakens* the gate that counts by training the human to
ignore it.

This is why tiering is the safety mechanism, not a performance optimization. Spending human attention
only on the irreversible and expensive actions is what keeps that attention sharp when it lands. A gate
that a reviewer reads is worth more than ten gates they wave through.

## Making the approval real

Even a correctly-placed gate is only oversight if the human can actually **judge what they are
approving**. A bare `approve? yes/no` with no detail reduces the human to a rubber stamp. A meaningful
request shows the concrete **action**, its **parameters**, the assessed **risk level**, and enough
**context** to decide.

```python
def build_approval_request(action, params, risk):
    return {
        "action": action,          # "charge_payment"
        "params": params,          # {"customer": "c_42", "amount_usd": 5000}
        "risk": risk,              # "high"
        "summary": f"Charge ${params['amount_usd']} to {params['customer']}",
    }
```

Three design rules make the approval surface hold up:

- **Show the scope.** The human needs the *what*, *on what*, and *how much* — not a yes/no with the
  details hidden.
- **Batch, don't flood.** If the agent needs to delete 500 records, present the batch as **one**
  reviewable action with its full scope shown. Firing 500 separate prompts guarantees habituation; a
  single scoped request keeps the decision reviewable.
- **Route to authority.** Who approves matters as much as whether someone does. A high-value refund above
  a junior's limit should **escalate** to someone empowered to approve it, not go to whoever is nearest.
  This is the escalation pattern applied to *authority*, not just difficulty.

The through-line is **oversight that fits human attention**. The gate exists to put a person on the
irreversible actions; the approval UX exists to make sure that person can actually be a check rather than
a click. Get the tiering right and the surface right, and the human in the loop is real — the same
fail-closed discipline that [safety-engineering](../safety-engineering/) brings to unsafe outputs, aimed
at the actions an agent can't take back.
