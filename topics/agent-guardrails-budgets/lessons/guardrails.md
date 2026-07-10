# Agent guardrails — high-risk actions

## Allow-lists and deny-by-default

Budgets bound *how much* an agent does; **guardrails** bound *what* it is allowed to do. The
foundational guardrail is the **allow-list**: only an explicitly approved set of tools and actions can
run, and **everything else is denied by default**.

Contrast this with a **deny-list** (block-list), which enumerates bad actions and permits the rest. A
deny-list **fails open**: any harmful action nobody thought to forbid slips through. An allow-list
**fails safe**: an action nobody approved simply can't run. For an autonomous agent that composes its
own actions, deny-by-default is the safer posture.

## Confirmation, HITL, and circuit breakers

Some actions are **high-risk or irreversible** — deleting data, spending money, sending an external
message. For these, an allow-list isn't enough; the action needs a gate **before** it executes:

- **Human-in-the-loop (HITL) confirmation** — pause and require explicit human approval before the
  action runs. Logging the action *after* it happens does not prevent the harm; a confirmation gate
  does.
- **Escalation** — when the agent is uncertain or a risk threshold is crossed, hand control to a human
  rather than guessing.
- **Circuit breaker** — borrowed from distributed systems: when a failure or risk signal crosses a
  threshold, **trip** and halt the run, stopping the agent from repeating a failing or dangerous action
  until the condition clears.

## The tradeoff

Guardrails trade **autonomy for safety**. Stricter guardrails — more confirmations, tighter
allow-lists — reduce runaway risk but add human latency and cost and slow the agent down. More
permissive guardrails increase throughput but raise the chance of irreversible harm. The right setting
is tuned to the **blast radius** of each action: read-only lookups can run freely, while anything
destructive or costly earns a confirmation gate.
