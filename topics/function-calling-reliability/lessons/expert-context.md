# Expert context: papers, frontier & interview

## Papers people and the frontier

Function-calling reliability sits on a short, nameable canon — the work that turned "the model
learns to call a tool" into an engineering discipline you can evaluate and standardize:

- **Toolformer** (Schick et al., 2023) showed models can *learn to call tools/APIs* — inserting API
  calls into their own generation and learning when a tool helps. It reframed tool use as a
  learnable model capability rather than a purely prompt-engineered trick.
- **Gorilla** (Patil et al., Berkeley, 2023) focused on models calling *large, real API surfaces*
  correctly, and the same line of work gave the field the **Berkeley Function-Calling Leaderboard**,
  the reference benchmark for evaluating tool/function-calling ability.
- **Model Context Protocol (MCP)** (Anthropic, 2024) is the open standard for the *tool boundary* —
  a common interface between models/agents and tools, so a tool implemented once is usable across
  hosts instead of re-wired per vendor.

Tools you'd reference: **MCP**, provider tool/function-calling APIs, and validators like
**Pydantic/Zod**. Current SOTA is **typed contracts + argument validation + idempotency**, with MCP
increasingly treated as the tool-interface standard. Open problems experts still argue about:
reliable **multi-tool orchestration**, robust **argument grounding**, and **exactly-once** execution
at scale.

## Interviewing on function calling reliability

What a strong interviewer probes here:

- Do you make mutating tools **idempotent** — so a retried call after a lost response doesn't apply
  the effect twice? Reach for **idempotency keys** and **read/write separation** unprompted.
- How do you handle an **unknown or hallucinated tool call** — reject and return a structured,
  model-facing error so the loop can correct, rather than guessing or executing it?
- Do you **validate arguments against a typed schema** before any side effect, instead of trusting
  the model's output?

**Red flags** that sink candidates: **executing unvalidated arguments**, **non-idempotent
mutations**, and **trusting tool names blindly**. Asked to design a reliable function-calling layer,
lead with a **typed contract per tool**, then **argument validation before execution**, then
**idempotency keys with read/write separation** — and name **Gorilla / the Berkeley
Function-Calling Leaderboard** as how the capability is evaluated and **MCP** as the emerging
standard for the tool boundary. Knowing the canon *and* the safety mechanics is what reads as senior.
