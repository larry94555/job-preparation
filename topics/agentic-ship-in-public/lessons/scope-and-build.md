# Ship in public — scope it, then make it real

## Scope the agent so it ships

The most common way a capstone dies is not a hard bug — it is scope. An agent designed as a broad
"platform" never finishes, so it never ships, so it is never proof of anything. A toy that can't fail
finishes but has nothing to write up. The right size sits between: **small enough to finish, real enough
to break.** Pick one useful task the agent does end to end — a research summarizer, a code-review helper,
a data-wrangling assistant — and resist adding a second. A single self-designed task that produces a
genuine break-and-fix is worth more than a sprawling feature list that stays half-built.

Scope is also what makes the agent *yours*. A project you scoped and designed has decisions in it — which
tools, which validation boundary, where to cap the loop — and those decisions are exactly what a reviewer
interrogates. A tutorial clone has none of them, which is why "small and self-designed" beats "large and
copied" as a hiring signal.

## Make it a real agent, not a toy

Three behaviors turn the scoped task into a real agent — and they are the same three an interviewer
probes for.

- **A bounded loop.** Keep stepping until the model returns a final answer or you hit a hard step cap
  (`max_steps`). The cap *guarantees termination*: a misbehaving model can't spin forever, and when the
  cap is reached you return an explicit `step_limit` result instead of hanging. A loop with no cap is the
  classic capstone failure.
- **Observation validation.** A real agent does not assume a tool returned something useful. After each
  tool call, check the observation — an empty or `None` result is recorded as `ok: False` and fed back as
  an error note so the model can recover, rather than trusting garbage and hallucinating over it. Skipping
  this is how an agent confidently summarizes nothing.
- **A trace.** Record every step — which tool ran and whether it was `ok`. The trace makes the run
  *auditable*: after the fact you can explain exactly what happened and which tool returned nothing. That
  is how you find a break, and it is what a demo and a write-up ultimately draw on.

Bounded, validated, traced: those three are the difference between a capstone and a toy, and they are what
your README, eval suite, and demo are meant to prove about the agent you ship.
