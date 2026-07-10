# Expert Surface — safety-engineering

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain prompt injection: untrusted input smuggling instructions the model follows as authoritative — `lessons/injection.md`, `questions/mcq.yaml`, `questions/missing-term.yaml`.
- ✅ **[L3]** Distinguish direct vs. indirect injection and why indirect is the harder agentic problem — `lessons/injection.md`, `questions/mcq.yaml` `[injection]`.
- ✅ **[L3]** Command the vocabulary: trust boundary, provenance, fencing, blast radius, egress, confused deputy — `lessons/boundary.md`, `lessons/permission.md`, `questions/free-entry.yaml`, `missing-term.yaml`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** "Prompt injection" coined by Simon Willison (2022) — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** Indirect prompt injection characterized by Greshake et al. (2023) — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** OWASP LLM Top 10 as the field risk checklist; injection as confused-deputy — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- ✅ **[L4]** No robust general injection defense as the standing open problem (indirect/agent injection, provenance at scale, agent egress control, OWASP LLM Top 10 evolution) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five safety levers (provenance, fencing, filtering, least privilege, egress) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a safety design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a safety design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Why filtering alone fails and defense-in-depth is required — `lessons/injection.md`, `questions/mcq.yaml` `[injection]`.

## D4 — Problem solving
- ✅ **[L3]** Trace an exfiltration path from injected content to a data-out tool call and cut it at egress — `lessons/permission.md`, `questions/mcq.yaml` `[leakage]`.
- ✅ **[L3]** Diagnose a confused-deputy scenario and apply provenance + confirmation to block it — `lessons/build-authz.md`, `questions/build.yaml` `[permission]`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement provenance-aware authorization (block untrusted + high-risk + unconfirmed) — `exercises/authz`, `questions/code.yaml`.
- ✅ **[L4]** Implement prompt-level fencing / provenance tagging of untrusted spans — `exercises/fence-untrusted`, `questions/frontier-ops.yaml` `[boundary]`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Guardrails frameworks and injection detectors (Rebuff, LLM-Guard), policy engines as the tooling — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- ✅ **[L3]** Operational egress controls and safety signals (injection-attempt detection, blocked-egress, tool-permission-denial, incident/false-positive rate) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the safety frontier moves (provenance at scale, agent egress control) and how to track it — `reading-list.md`, pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags: direct vs. indirect, confused deputy, why filtering fails — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a defense-in-depth agent-security design under questioning — `questions/deep-dive.yaml` design-review essay, `questions/essay.yaml`.

## Coverage summary
20 items · ✅ 20 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
Open work: none — the D5 fencing/provenance-tagging coding exercise closed the last partial.

<!-- coverage: items=20 covered=20 partial=0 gap=0 -->
