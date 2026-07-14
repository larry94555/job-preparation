# Human-in-the-loop — pause, step in, resume

## Pause, step in, resume

An approval gate only works if the agent can actually **stop and wait**. The full lifecycle of a
human-in-the-loop action is three beats: the agent runs until it hits a high-risk action and
**pauses**; a human **steps in** and approves, rejects, or edits; and the agent **resumes** from
exactly where it paused, with the human's decision folded in. The hard engineering is not the pause —
it is resuming *cleanly*, so the agent picks up its plan without re-doing the work it already did or
losing the context it had.

```python
state = run_until_gate(task)          # runs low/medium steps, stops at a high-risk action
# ... process exits, waits minutes or days for a human ...
decision = wait_for_human(state.pending_action)
result = resume(state, decision)      # continue from the saved state, not from scratch
```

Clean resumption means the pause is **durable**: the agent's state — its plan, its messages, the
pending action — is saved so a person can take minutes, hours, or days to respond and the agent resumes
correctly when they do. This is why the pattern needs persisted state, not just an in-memory
`input()` prompt. Modern agent frameworks model this as an **interrupt**: the run halts at a
checkpoint, waits for external input, and continues from the checkpoint — the same shape as the
`pause → human → resume` cycle above.

A human might never answer, so every gate needs a **timeout**. If no decision arrives within the
window, the action must **fail safe** — default to *rejected*, never to *executed*. Defaulting a
pending high-risk action to "approved" because a reviewer went to lunch is exactly the irreversible
mistake the gate existed to prevent.

```python
decision = wait_for_human(state.pending_action, timeout=3600)
if decision is None:                  # nobody answered in time
    decision = "rejected"             # fail SAFE — never auto-approve on timeout
    audit.record(state.pending_action, state.params, "high", "rejected_timeout")
```

The timeout closes the loop: a pause cannot hang forever, and it cannot silently escalate into an
unapproved action. This is the same fail-closed default that [safety-engineering](../safety-engineering/)
applies to unsafe outputs and that [agent-guardrails-budgets](../agent-guardrails-budgets/) applies when
a budget is exhausted — when in doubt, do the *safe* thing, and leave an audit record explaining why.
