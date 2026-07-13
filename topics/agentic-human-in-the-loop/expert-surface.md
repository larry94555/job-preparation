# Expert Surface — agentic-human-in-the-loop

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain why full autonomy is dangerous — an agent that can act can act wrongly, and some actions are irreversible or expensive — `lessons/why-hil.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: risk level, irreversible, approval gate, audit trail, pause/resume, timeout, fail-safe — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (the "keep a human on the actions that matter" idea ↔ the risk-classify → gate → audit → resume mechanism) — `lessons/why-hil.md`, `lessons/risk-gates.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** Human-in-the-loop as the oversight side of the RLHF lineage (humans in training ↔ humans supervising at runtime) — `lessons/expert-context.md`, `reading-list.md`.
- ✅ **[L3]** Approval gates, escalation, and confidence-threshold / ask-when-unsure as the named HITL patterns — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Framework interrupts (e.g. LangGraph) as the built-in pause → human → resume primitive — `lessons/resume.md`, `lessons/expert-context.md`.
- ✅ **[L4]** Frontier open problems: calibrated confidence for autonomy-by-confidence, and where the oversight line should sit per action — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** Risk classification (reversibility × cost → low/medium/high) as the routing decision for oversight — `lessons/why-hil.md`, `questions/mcq.yaml`.
- ✅ **[L3]** The approval gate as the seam between intent and effect: execute is blocked until an explicit human yes — `lessons/risk-gates.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Durable pause and clean resumption (interrupts) vs. an in-memory prompt, and fail-safe timeouts — `lessons/resume.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose an ungated irreversible action and prescribe risk-gating behind approval — `lessons/why-hil.md`, `lessons/risk-gates.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Diagnose a gate that hangs forever and prescribe a fail-safe timeout that defaults to rejected — `lessons/resume.md`, `questions/mcq.yaml`, `essay.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement risk classification of an action (`assess_risk`) — `exercises/risk-gate`, `questions/code.yaml`.
- ✅ **[L3]** Implement an approval gate that blocks execute on rejection and audits every decision (`execute_with_approval`) — `exercises/approval-gate`, `questions/code.yaml`.
- ✅ **[L3]** Implement an append-only, queryable audit trail (`AuditLog`) — `exercises/audit-log`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Framework interrupts + persisted checkpoints + audit logging as the practical HITL stack — `lessons/resume.md`, `lessons/expert-context.md`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the HITL frontier moves (calibrated confidence, the shifting autonomy line) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard why irreversible actions need a human and defend risk-gating, auditability, and fail-safe resumption under questioning — `questions/essay.yaml` (`essay-hil`, `essay-audit`).

## Coverage summary
18 items · ✅ 18 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (calibrated autonomy-by-confidence, multi-agent oversight, standardized approval protocols).

<!-- coverage: items=18 covered=18 partial=0 gap=0 -->
