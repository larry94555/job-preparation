# Expert Surface — agentic-multi-agent

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain why you start with a single agent and add agents only when one demonstrably can't do the job — `lessons/when-multi-agent.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: supervisor, specialist, orchestration, handoff, validation, critic, approval loop — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (the team-with-a-coordinator analogy ↔ the supervisor/specialist/handoff mechanics) — `lessons/when-multi-agent.md`, `lessons/supervisor.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** The supervisor/single-coordinator pattern as the default multi-agent design — `lessons/supervisor.md`, `lessons/expert-context.md`.
- ✅ **[L3]** Multi-agent frameworks (AutoGen, CrewAI, LangGraph) and the topologies they encode — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Supervisor/hierarchical vs. network topologies and when to pick which — `lessons/expert-context.md`, `lessons/topologies.md`, `questions/expert.yaml`.
- ✅ **[L3]** The supervisor pattern named as orchestrator-worker, and how frameworks (LangGraph/CrewAI/AutoGen) spell each topology — `lessons/topologies.md`, `questions/expert.yaml` (`expert-orchestrator-worker`).
- ✅ **[L4]** Frontier open problems: reliable handoffs at scale, cost explosion, emergent failures — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.
- ✅ **[L4]** Multi-agent evaluation at scale: why green per-agent/per-handoff checks don't certify the system and why end-to-end attribution is an open problem — `questions/frontier-ops.yaml` (`frontier-multi-agent-eval`).

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** The supervisor pattern as an architecture: decompose, route to specialists, combine results — `lessons/supervisor.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Specialists as narrow, testable agents vs. one do-everything agent — `lessons/supervisor.md`, `questions/mcq.yaml`.
- ✅ **[L3]** When multi-agent is worth its coordination/latency/cost overhead vs. a single agent — `lessons/when-multi-agent.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L4]** Treat handoffs as an explicit, validated, typed protocol (not an implicit convention) so a silent bad output becomes a loud, localized failure at the seam — `lessons/handoffs.md`, `questions/expert.yaml` (`expert-handoff-protocol`).

## D4 — Problem solving
- ✅ **[L3]** Diagnose a silent bad output crossing an unvalidated handoff and prescribe boundary validation — `lessons/handoffs.md`, `lessons/failure-modes.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Diagnose an infinite approval loop and prescribe a bounded max-tries exit — `lessons/failure-modes.md`, `questions/mcq.yaml`, `free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement the supervisor coordinating specialists with a bounded revision loop (`supervise`) — `exercises/supervisor`, `questions/code.yaml`.
- ✅ **[L3]** Implement handoff validation that rejects empty output with a structured error (`validate_handoff`) — `exercises/handoff-validate`, `questions/code.yaml`.
- ✅ **[L3]** Implement a bounded approval loop that exits at max_tries (`revise_until_approved`) — `exercises/approval-loop`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** LangGraph + CrewAI + AutoGen + the supervisor/critic patterns as the practical multi-agent stack — `lessons/expert-context.md`, `lessons/failure-modes.md`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the multi-agent frontier moves (reliable handoffs, cost of multi-agent, emergent failures at scale) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard the supervisor pattern and defend "single agent first" and validate-every-handoff under questioning — `questions/essay.yaml` (`essay-supervisor`, `essay-handoffs`).

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (long-horizon agent graphs, learned routing, multi-agent evaluation at scale).

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
