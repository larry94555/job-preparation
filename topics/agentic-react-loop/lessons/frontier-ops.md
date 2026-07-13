# Single-agent workflows — the frontier

## Reliability of long-horizon agents

The ReAct loop and its four guardrails — a max-steps cap, a can't-finish path, per-step logging, and
output validation — are the solid ground. The frontier is what happens when a *single* agent runs the
loop over a **long horizon**: dozens of steps, each depending on the last. There, reliability stops
being a given.

- **Errors compound silently.** In a long loop, an early wrong observation or a misread tool result
  does not throw — it just tilts every subsequent Thought. By the twentieth step the agent has drifted
  far from the task, and no single step looks broken. Keeping a long single-agent run correct is an
  **open problem**, not a solved one.
- **Error recovery is hard.** Detecting that the loop has gone off the rails, and recovering — backing
  up, re-grounding, or abandoning cleanly — is much harder than bounding it. The guardrails *bound and
  surface* the failure (the cap stops it, the log shows where it drifted), but they do not by themselves
  make the agent **recover** and get back on track.
- **Guardrails bound, they don't guarantee.** A bigger `max_steps` gives a drifting agent more room to
  drift; a faster model runs the same flawed loop quicker. The honest read is that the step cap,
  can't-finish path, logging, and output validation are necessary and they contain the damage — but
  long-horizon reliability and robust error recovery are the active research edge, not a checkbox.

The reason to track this frontier: it is the same trust gap the whole topic is built on — *the agent is
an untrusted driver of its own loop* — but stretched to the horizon where one validated step is no
longer the whole story. An expert can say which of these a single-agent system should invest in first,
and does not claim long-horizon reliability is solved.

See [agent-guardrails-budgets](../../agent-guardrails-budgets/) and
[harness-engineering](../../harness-engineering/) for the operational building blocks this frontier
stresses.
