# Reading list & staying current — harness-engineering

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **ReAct — Yao et al. (2022).** The paper that framed the reason-then-act loop most harnesses harden.
  Notice how interleaving reasoning traces with actions is the primitive: think → act → observe, repeated
  under a budget. This is the single most important read for the topic — the harness is this loop made reliable.
- **Anthropic "Building Effective Agents" (2024).** The simplicity/composability touchstone. Notice the
  argument to reach for the simplest structure that works and add agents only when the task demands it —
  the antidote to over-orchestration and the AutoGPT-style unbounded loop.

## Go deeper (self-correction & learned tool use)
- **Reflexion — Shinn et al. (2023).** Self-reflection and retry as an explicit loop feature. Notice that
  the reflection lives in the *harness* (verify, reflect, retry), not in a longer prompt — reliability comes
  from structure, not wording.
- **Toolformer — Schick et al. (Meta, 2023).** Models learning *when and how* to call tools. Notice the
  boundary this draws: the model decides to call a tool, but the harness owns the contract, execution, and
  validation of the result.

## Frontier — what to watch
- **SWE-bench-style agentic coding harnesses.** The benchmark frontier for long-horizon, verifiable agent
  work. Notice these harnesses win or lose on *verification* — running tests, checking diffs — far more than
  on raw model capability. Watch for eval-gated claims, not leaderboard theater.
- **Reliable long-horizon autonomy & open-ended verification.** The live open problems: keeping an agent on
  task over many steps, verifying tasks with no crisp success check, and robust error recovery. Watch how new
  systems detect "stuck" and recover, not just how they succeed on the happy path.

## Tools & implementations worth reading
- **Claude Agent SDK, OpenAI Agents SDK, LangChain / LlamaIndex, smolagents.** The harness stacks that
  implement the loop, tool contracts, and budgets. Reading a loop implementation is the fastest way to turn
  ReAct into a mental model of real code.
- **AutoGPT — the cautionary tale.** Worth reading precisely as the unbounded-loop failure mode: no budgets,
  no verification, no termination discipline. Notice exactly what a hardened harness adds back.

## How to stay current on this topic
- Follow the **Claude Agent SDK / OpenAI Agents SDK / smolagents** repos and release notes — loop control,
  tool contracts, and budget features land in code first.
- Track **SWE-bench and agentic-coding leaderboards** plus the NeurIPS/ICML agents tracks for the next
  autonomy/verification result — and read them for the *harness*, not the base model.
- When a new agent technique appears, ask the three canon questions: *what does it trade (reliability/
  latency/autonomy), what regime does it win in, and what eval proves it?* — the same lens the deep-dive uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
