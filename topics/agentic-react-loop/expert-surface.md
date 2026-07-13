# Expert Surface — agentic-react-loop

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain the ReAct loop a single agent runs — Reason → Act → Observe → Decide — and why it beats one-shot answering — `lessons/react-loop.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: thought, action, observation, decide, step kind, loop, max-steps, can't-finish, validate — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (the reason/act/observe analogy ↔ the action/final step kind that drives the loop) — `lessons/react-loop.md`, `lessons/reason-act-observe.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** ReAct (Yao et al., 2022) as the origin of interleaved reasoning + acting, and why the synergy beats either alone — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Reasoning-only (chain-of-thought) vs. acting-only vs. interleaved ReAct — knowing what each half lacks — `lessons/expert-context.md`.
- ✅ **[L4]** Frontier open problem: reliability and error recovery in long-horizon single-agent loops (errors compound silently) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** The ReAct loop as an architecture: continue on an action step, return on a final, driven by the step kind — `lessons/react-loop.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Observe-before-decide: feed the real result back so the next decision is grounded, not guessed — `lessons/reason-act-observe.md`, `questions/mcq.yaml`.
- ✅ **[L3]** The four guardrails (max-steps cap, can't-finish path, per-step logging, output validation) as complementary safety layers — `lessons/guardrails.md`, `lessons/validate-outputs.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose an agent that spins forever and prescribe a max-steps cap plus an honest can't-finish result — `lessons/guardrails.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Diagnose an agent reasoning over garbage and prescribe validating observations before feeding them back — `lessons/validate-outputs.md`, `questions/mcq.yaml`, `free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement the ReAct loop with a step cap and a step_limit result (`run_react`) — `exercises/react-loop`, `questions/code.yaml`.
- ✅ **[L3]** Implement observation validation that rejects empty/malformed output (`validate_observation`) — `exercises/validate-observation`, `questions/code.yaml`.
- ✅ **[L3]** Implement a ReAct step parser handling the optional Action line (`parse_react`) — `exercises/reason-act-parse`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** ReAct-style agent loops as implemented in agent frameworks (LangChain/LlamaIndex loops) plus per-step logging/observability as the practical stack — `lessons/expert-context.md`, `lessons/guardrails.md`, `reading-list.md`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the single-agent-loop frontier moves (long-horizon reliability, error recovery) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.
- ✅ **[L2]** Read a run's per-step log to reconstruct what an agent reasoned, called, and observed at each step — `lessons/guardrails.md`, `reading-list.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard the ReAct loop end to end and defend the guardrails under questioning — `questions/essay.yaml` (`essay-react`, `essay-guardrails`).

## Coverage summary
18 items · ✅ 18 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (long-horizon reliability evals, automated error recovery for single-agent loops).

<!-- coverage: items=18 covered=18 partial=0 gap=0 -->
