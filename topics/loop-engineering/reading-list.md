# Reading list — loop-engineering

A curated path into engineering agent loops, grounded in the canon. Read for the *ideas* — the loop
shape each work introduced and the failure it addresses — not for citation trivia.

## The canon (read these first)

- **ReAct: Synergizing Reasoning and Acting in Language Models** — Yao et al., 2022. The reason-then-act
  loop that interleaves chain-of-thought with tool actions. This is the shape most agents harden into a
  single bounded loop.
- **Reflexion: Language Agents with Verbal Reinforcement Learning** — Shinn et al., 2023. Adds
  self-reflection and retry: critique a failed attempt and revise, rather than repeat it.
- **Toolformer: Language Models Can Teach Themselves to Use Tools** — Schick et al. (Meta), 2023.
  Grounds the "act" half of the loop — models learning to call tools/APIs as part of generation.
- **Tree of Thoughts: Deliberate Problem Solving with Large Language Models** — Yao et al., 2023.
  Generalizes the loop into search over scored branches — the search-loop shape.
- **Building Effective Agents** — Anthropic, 2024. The practitioner touchstone: prefer the simplest loop
  that works and add structure only when it earns its keep (the most-constrained-shape rule).

## Frontier & practice

- **SWE-bench** and SWE-agent-style agentic-coding harnesses — the benchmark frontier for long-horizon,
  *verifiable* loop work, where running the project's tests decides success. The load-bearing lesson:
  loops win or lose on verification, not raw model capability.
- Practitioner writing on **long-horizon autonomy**, **context compaction**, and **error recovery** —
  the structural techniques that let a loop run long and still finish.

## Tools & stacks

- **Claude Agent SDK**, **LangGraph**, **OpenAI Agents SDK** — loop/orchestration frameworks.
- **SWE-agent** — a reference agentic-coding harness.
- **AutoGPT** — the cautionary unbounded-loop example: no budget, no verification, no stop reason.

## How to stay current

The field moves fast, so track *ideas*, not headlines. For any new agent framework or paper, ask three
questions — the same canon lens this topic teaches:

1. **What loop shape is it?** Single bounded loop, plan-then-execute, reflect-retry, or search?
2. **How does it make and verify progress?** Is there a real success signal gating each step, or is it
   trusting the model's claim?
3. **How is it bounded and recovered?** Budgets, no-progress detection, named stop reasons, and a
   classify-then-recover policy — or an unbounded loop with a fancier name?

If a new tool can't answer these, it hasn't advanced loop engineering — it has renamed it.

## Reception & what aged

- **ReAct** aged into the default: nearly every production agent is a hardened ReAct loop.
- **Reflexion** and **Tree of Thoughts** aged as *conditional* tools — worth their cost only when
  failures are informative (Reflexion) or the task genuinely branches (ToT), which is exactly the
  most-constrained-shape lesson.
- **AutoGPT**'s early hype aged into the canonical cautionary tale — the unbounded loop that demos and
  then spins — and is why bounding and verification are now table stakes.
