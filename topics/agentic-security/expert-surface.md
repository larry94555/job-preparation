# Expert Surface — agentic-security

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain what prompt injection is and why it is the biggest threat to an agentic system — `lessons/injection.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: prompt injection, untrusted content, separation, sanitize, sandbox, redact PII, output filter — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (confused-deputy analogy ↔ the concrete separate/sanitize/sandbox/redact/filter controls) — `lessons/injection.md`, `lessons/separation.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** OWASP Top 10 for LLM Applications, with prompt injection at #1 — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Direct vs. indirect injection (Greshake et al., 2023) and Simon Willison on why there is no clean fix — `lessons/expert-context.md`, `lessons/injection.md`.
- ✅ **[L3]** Guardrails as the rest of the OWASP list: insecure output handling, excessive agency, sensitive data disclosure — `lessons/guardrails.md`, `lessons/redaction.md`, `questions/expert.yaml`.
- ✅ **[L4]** Frontier open problems: indirect/second-order injection via tool-fetched content, no general solution, unsolved at scale — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** Separate trusted system instructions from untrusted content as the first, most important defense — `lessons/separation.md`, `questions/mcq.yaml`.
- ✅ **[L3]** The agent as a confused deputy and gating high-authority tools behind allow-lists — `lessons/injection.md`, `lessons/redaction.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Defense in depth vs. a single control; build security in, not bolt it on — `lessons/guardrails.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Control the egress: exfiltration is a data-flow problem, so gate the data-out step with a default-deny destination allow-list, not just the tool — `lessons/egress.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose an injection-vulnerable prompt and prescribe separation + sanitizing — `lessons/separation.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Diagnose PII flowing into the context or a dangerous tool call and prescribe redaction + output filtering — `lessons/redaction.md`, `questions/mcq.yaml`, `free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement a sanitizer that scrubs injection patterns to a marker (`sanitize`) — `exercises/injection-sanitize`, `questions/code.yaml`.
- ✅ **[L3]** Implement a PII redactor for emails and secret-like tokens (`redact`) — `exercises/pii-redact`, `questions/code.yaml`.
- ✅ **[L3]** Implement an output filter that blocks disallowed tools (`filter_output`) — `exercises/output-filter`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Sandboxing untrusted execution as both a technical control and a compliance/tenant-isolation boundary — `lessons/guardrails.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Egress allow-listing and human-confirmation on data-out steps (HTTP, email, webhook) as the operational exfiltration control that fails closed — `lessons/egress.md`, `questions/mcq.yaml`, `questions/free-entry.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the agent-security frontier moves (indirect injection, tool-chained payloads, scale) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard the injection threat model and defend separate-then-guardrail under questioning — `questions/essay.yaml` (`essay-injection`, `essay-guardrails`).
- ✅ **[L3]** Defend the deeper cuts under questioning: direct vs. indirect injection, sandbox tenant-isolation, and the input/output data-flow guardrails — `questions/essay.yaml` (`essay-direct-vs-indirect`, `essay-sandbox-tenant`, `essay-data-flow-guardrails`), `questions/expert.yaml`.

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (robust defenses against indirect injection, provably-isolated multi-agent tool chains).

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
