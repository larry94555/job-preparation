# Multi-agent orchestration — expert context

## Multi-agent patterns

Multi-agent orchestration has a small vocabulary of **topologies**, and knowing which to reach for —
and which to avoid — is what reads as senior.

- **Supervisor (single coordinator).** One agent decomposes the task, routes sub-tasks to specialists,
  and assembles the results; specialists report back to the supervisor. This is the sensible **default**:
  coordination is centralized, so the flow is observable and easy to debug.
- **Hierarchical (supervisors of supervisors).** The supervisor idea nested: a top-level supervisor
  coordinates mid-level supervisors that each own a cluster of specialists. It scales the supervisor
  pattern to larger tasks while keeping every seam a clear parent→child handoff.
- **Network (peer-to-peer).** Agents talk directly to one another with no single coordinator. It is the
  most flexible topology and the hardest to trace, bound, and control — emergent interactions become
  failures no one agent caused. Reach for it only when a hierarchy genuinely can't express the
  collaboration.

```python
# Supervisor: centralized, debuggable — the default.
result = supervisor.run(task, specialists=[researcher, writer, critic])
```

The frameworks you'll meet encode these directly: **LangGraph** models agents as nodes in an explicit
graph, **CrewAI** frames a "crew" of role-specialized agents, and **AutoGen** supports both supervised
and conversational (network-ish) arrangements. The durable lesson underneath the frameworks: prefer the
**most constrained** topology that solves the problem — usually supervisor or hierarchical — because
constraint is what buys you observability and bounded failure. Grade any of these arrangements with the
same rigor as any component; see [eval-methodology](../eval-methodology/).
