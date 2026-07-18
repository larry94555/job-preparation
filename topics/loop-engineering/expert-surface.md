# Expert Surface — loop-engineering

**SOTA snapshot: 2026-07-17.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain the anatomy of an agent loop: observe → decide → act → verify, loop vs. pipeline, and termination as a first-class output — `lessons/loop-anatomy.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: loop shape, measurable progress, no-progress, oscillation, convergence, recovery, compaction, stop reason — `lessons/loop-progress.md`, `questions/shapes.yaml`, `questions/progress.yaml`.
- ✅ **[L3]** State and defend the core thesis — "the loop is the unit of agent design; getting an agent to finish is loop engineering" — `lessons/loop-anatomy.md`, `questions/essay.yaml`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** ReAct (Yao et al. 2022) as the reason-then-act loop most agents harden — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** Reflexion (Shinn et al. 2023) for reflect-retry, Toolformer (Schick et al. 2023) for learned tool use, Tree of Thoughts (Yao et al. 2023) for deliberate search — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Anthropic "Building Effective Agents" (2024) as the most-constrained-shape touchstone — `lessons/expert-context.md`.
- ✅ **[L4]** SWE-bench-style agentic-coding harnesses as the benchmark frontier for long-horizon verifiable loops — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five loop levers (shape, progress+verification, termination/bounding, state, recovery) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** Choose the loop shape (single bounded loop vs. plan-then-execute vs. reflect-retry vs. search) via the most-constrained-shape rule — `lessons/loop-shapes.md`, `lessons/deep-dive.md`.
- ✅ **[L4]** Review a loop design and spot unverified progress, unbounded loops, blind retry, and an over-engineered shape — `questions/deep-dive.yaml` (L4 review MCs + design essay).

## D4 — Problem solving
- ✅ **[L3]** Diagnose a stalling loop to no-progress or oscillation and choose the intervention — `lessons/loop-progress.md`, `questions/progress.yaml`.
- ✅ **[L3]** Choose the recovery for a failure: classify transient vs. permanent, then retry / re-plan / escalate — `lessons/loop-progress.md`, `questions/progress.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a bounded loop with no-progress detection (unchanged state), named termination, and correct precedence (done > no-progress > budget) — `exercises/bounded-loop`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Loop stacks — Claude Agent SDK, LangGraph, OpenAI Agents SDK, SWE-agent as an agentic-coding harness; AutoGPT as the unbounded-loop cautionary tale — `lessons/expert-context.md`.
- ✅ **[L3]** Operational signals for a running loop (steps/task, stop-reason distribution, no-progress/stuck rate, verification-failure rate) — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the loop frontier moves (reliable long-horizon autonomy, verifying open-ended tasks) and how to track it — `reading-list.md` (curated papers/tools + a staying-current method), plus pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags: design the loop not the prompt; most-constrained-shape; bound and verify; avoid unbounded loops and trusting unverified progress — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a loop design under questioning — lead with shape, then progress+verification, then bounding, then recovery — `questions/deep-dive.yaml` design essay, `questions/expert.yaml` interview essay.

## Coverage summary
18 items · ✅ 18 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
Full coverage of the current SOTA surface; revisited as the field moves.

<!-- coverage: items=18 covered=18 partial=0 gap=0 -->
