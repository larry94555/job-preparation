# 2. Loop engineering: designing the agent loop that finishes real tasks — Lesson-Plan Breakdown

**Slug:** `loop-engineering` · **Depth:** authored (A+ parity; built 2026-07-17) · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Getting an agent to reliably *finish* a real task is loop engineering — designing the
observe → decide → act → verify cycle, keeping it making measurable progress, verifying each step,
recovering from failure, and bounding it. The discipline behind coding agents and long-horizon autonomy.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** the loop as the unit of design; observe→decide→act→verify; loop vs. pipeline; loop state;
  termination as an output; loop shapes; measurable progress; no-progress/oscillation; recovery; compaction.
- **Key terms:** agent loop, stop reason (done/budget/no-progress), loop shape, plan-then-execute,
  reflect-and-retry, edit→run→observe, no-progress detection, oscillation, convergence vs. thrash, compaction.
- **Tradeoffs:** simplest-shape vs. structure; verification cost vs. drift; context length vs. legibility.
- **Patterns:** single bounded loop; plan-then-execute; reflect-retry; verify-each-step; classify-then-recover.
  **Antipatterns:** unbounded loop; trusting unverified progress; blind retry; reflexive multi-agent/search.
- **Architectures:** single bounded loop → plan-then-execute → reflect-retry → tree/graph search.
- **Papers/posts:** ReAct (Yao 2022); Reflexion (Shinn 2023); Toolformer (Schick 2023); Tree of Thoughts
  (Yao 2023); Anthropic "Building Effective Agents" (2024); SWE-bench-style harnesses.
- **Tools/OSS/models:** Claude Agent SDK, LangGraph, OpenAI Agents SDK; SWE-agent; AutoGPT (cautionary).
- **Open problems:** reliable long-horizon autonomy; verifying open-ended tasks; robust error recovery.
- **Interview signals:** design the loop not the prompt; most-constrained-shape; bound and verify; classify-then-recover.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Anatomy of a loop: observe→decide→act→verify; loop vs. pipeline; termination | T1 | L2→L3 | C1.1, C3.1 | MC |
| LP2 | Loop shapes and the most-constrained-shape rule | T1 | L3 | C3.1, C3.2 | MC |
| LP3 | Progress, convergence & recovery; no-progress/oscillation; compaction | T1 | L3 | C3.3, C4.1 | MC |
| LP4 | Build it: a bounded loop with progress detection + named termination | T2 | L4 | C5.4 | Code, Essay |
| LP5 | Architecture & tradeoffs: reviewing a loop design | T2 | L4 | C3.3, C3.4 | MC, Essay |
| LP6 | Frontier & operations: long-horizon autonomy, agentic-coding, live signals | T3 | L4 | C2.2, C6.2 | MC |
| LP7 | Expert context: papers, frontier & interview | T3 | L3→L4 | C2.1, C8.1 | MC, Essay |

**Relationship to neighbors:** `harness-engineering` (primitive loop + guards), `agentic-react-loop`
(ReAct as one shape), `agent-guardrails-budgets` (bounding), `agentic-tool-calling` (tool-use loop),
`production-failure-modes` (what goes wrong live).
