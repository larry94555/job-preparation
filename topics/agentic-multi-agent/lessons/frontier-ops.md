# Multi-agent orchestration — the frontier

## Multi-agent at scale

The supervisor pattern, validated handoffs, critics, and bounded approval loops are the solid ground.
The frontier is where a multi-agent system grows to dozens of agents and new, unsolved problems appear
— problems that more agents make *worse*, not better.

- **Reliable handoffs at scale.** A validated handoff catches an empty or malformed output, but across a
  large agent graph the errors that slip through **compound silently**: each handoff is mostly right, and
  by the tenth the end state has drifted with no single call to blame. Keeping handoffs reliable as the
  graph grows is an open problem, not a solved one.
- **Cost explosion.** Every added agent multiplies token cost — more prompts, more turns, more review
  loops. A system that scales to many agents can spend far more than the work is worth, and the spend
  climbs faster than the capability. Containing that cost while keeping quality is an active edge; route
  cheap sub-tasks to smaller models with [model-routing-fallback](../model-routing-fallback/) and cap
  every loop with [agent-guardrails-budgets](../agent-guardrails-budgets/).
- **Emergent failures.** Some failures don't come from any one agent — they **emerge** from agents
  interacting: two critics that deadlock, a revision loop that oscillates, agents that amplify each
  other's mistakes. These appear only at scale and resist attribution, which is what makes them hard.

The honest read is the same as everywhere on the frontier: a supervisor and validation help but do not
close these gaps, and a larger model or more agents does not automatically make a big multi-agent system
correct or cheap. An expert can name which of these to invest in first and does not claim they are
solved. Measuring any of it demands the same discipline as any component — see
[eval-methodology](../eval-methodology/).
