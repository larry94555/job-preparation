# Reading list & staying current — agentic-multi-agent

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **The supervisor pattern (orchestrator + specialists).** One coordinating agent decomposes a task,
  routes sub-tasks to specialist agents, and combines their results. Notice the reframing — the
  supervisor *orchestrates* rather than doing every step, and specialists report back to it, which is
  what keeps the flow observable and debuggable.
- **When *not* to go multi-agent.** The single most valuable habit: start with one agent and good tools,
  and split only when a single agent demonstrably can't do the job. Notice the cost multi-agent adds —
  coordination, latency, tokens, and new handoff failure modes — so "more agents" is a tradeoff, not a
  free upgrade.

## Go deeper (orchestration frameworks & handoffs)
- **AutoGen (Microsoft).** Multi-agent conversations with supervised and conversational arrangements.
  Notice how it frames agents talking to agents, and where a coordinator is (or isn't) in the loop.
- **CrewAI.** A "crew" of role-specialized agents with a coordinator. Notice the role/specialist framing
  — narrow agents with focused jobs — which is exactly the specialists-do-one-thing-well idea.
- **LangGraph.** Agents as nodes in an explicit graph with typed edges. Notice that making the topology
  *explicit* is what lets you reason about, validate, and bound each handoff instead of hoping.
- **Handoff validation.** The discipline of checking one agent's output at the boundary before the next
  agent consumes it. Notice that a silent bad output — plausible but wrong, with no exception — is the
  failure this prevents, by turning far-away corruption into a loud failure at the seam.

## Frontier — what to watch
- **Critic / reflexion loops (self-review agents).** An agent whose job is to review another's output and
  send it back for revision. Notice the durable takeaway *and* the hazard: a critic that never approves
  creates an infinite approval loop, so every such loop needs a bounded max-tries exit.
- **The cost of multi-agent.** Every added agent multiplies token and turn cost. Notice that spend can
  climb faster than capability, so cost containment (routing cheap sub-tasks to smaller models, capping
  loops) is a first-class design concern, not an afterthought.
- **Hierarchical vs. network topologies.** Supervisors-of-supervisors versus peer-to-peer agent graphs.
  Notice the tradeoff — a hierarchy is observable and bounded; a network is flexible but its emergent
  interactions are hard to trace and control — so prefer the most constrained topology that works.

## How to stay current on this topic
- Follow the **AutoGen / CrewAI / LangGraph** changelogs — new orchestration and handoff-validation
  affordances land there first.
- Track **multi-agent evaluation** work: how the field measures reliable handoffs, cost, and emergent
  failures at scale, not just single-agent accuracy.
- When a new multi-agent technique appears, ask: *what does it guarantee vs. merely encourage, what does
  it cost per added agent, and does it bound its loops?* — the same lens the frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
