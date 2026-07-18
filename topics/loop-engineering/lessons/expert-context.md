# Expert context: papers, frontier & interview

## Papers people and the frontier

Loop engineering has a small canon you should be able to name and place:

- **ReAct** (Yao et al., 2022) introduced the **reason-then-act** loop — interleaving chain-of-thought
  reasoning with tool actions. It is the shape most agent loops harden into a single bounded loop.
- **Reflexion** (Shinn et al., 2023) added **self-reflection and retry**: the agent critiques its own
  failed attempt and revises before trying again — the reflect-and-retry shape.
- **Toolformer** (Schick et al., Meta, 2023) showed models can **learn to call tools/APIs** as part of
  generation, grounding the "act" half of the loop.
- **Tree of Thoughts** (Yao et al., 2023) generalized the loop into **deliberate search** — exploring
  and scoring multiple branches — the search-loop shape.
- **"Building Effective Agents"** (Anthropic, 2024) is the practitioner touchstone: prefer the simplest
  loop that works, add structure only when it earns its keep — the most-constrained-shape rule.

The **frontier** builds on these: reliable long-horizon autonomy (structure that survives length),
agentic-coding harnesses evaluated on **SWE-bench**-style benchmarks (where running the tests decides
success), and trustworthy verification of open-ended tasks that lack a crisp gate.

In practice these loops are built on stacks like the **Claude Agent SDK**, **LangGraph**, and the
**OpenAI Agents SDK**; **SWE-agent** is a reference agentic-coding harness, and **AutoGPT** is the
cautionary unbounded-loop example — a loop with no budget, no verification, and no stop reason.

## Interviewing on loop engineering

The signal an interviewer listens for is whether you design the **loop**, not a bigger prompt. Lead
with the shape (a single bounded loop, escalating only on evidence), then **progress and
verification** (each step gated on a real signal), then **bounding** (budgets, no-progress detection,
named stop reasons), then **recovery** (classify a failure and retry / re-plan / escalate). Cite
**ReAct** for the loop, **Reflexion** for self-correction, and Anthropic's **"Building Effective
Agents"** for keeping it simple.

The **red flags** that sink a candidate: proposing an **unbounded** loop whose only exit is the model
saying "done"; trusting **unverified** progress; **blind-retrying** every failure; and reaching for
multi-agent or search when a single bounded loop would do.

## Related topics and how they connect

Loop engineering deliberately overlaps its neighbors; know the boundary:

- **harness-engineering** — owns the model/harness boundary and the **primitive** loop and its guards.
  Loop engineering goes deeper on engineering the loop as a system (shapes, progress, recovery).
- **agentic-react-loop** — develops the **ReAct** shape specifically; here ReAct is one shape among
  several (plan-then-execute, reflect-retry, search, edit-run-observe).
- **agent-guardrails-budgets** — owns the **bounding** mechanics (budgets, breakers, kill-switches) that
  every loop shape depends on; loop engineering references them and focuses on loop design and quality.
- **agentic-tool-calling** — owns the tool-use mechanics (`tool_result`, ids, schemas) the "act" phase
  assumes.
- **production-failure-modes** — the taxonomy of what goes wrong once a loop is live, and the recovery
  playbook the operating signals here feed into.
