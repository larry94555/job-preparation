# Reading list & staying current — agentic-react-loop

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **ReAct — Yao et al. (2022), "ReAct: Synergizing Reasoning and Acting in Language Models."** The paper
  the whole topic is built on: interleave a Thought, an Action (tool call), and an Observation in one
  loop. Notice the core claim — reasoning and acting *together* beat either alone, because the reasoning
  plans and revises the actions while the observations keep the reasoning grounded.
- **ReAct prompting (the Thought / Action / Action Input / Observation format).** The concrete prompt
  shape that drives the loop. Notice how the format makes each step parseable: a `Thought` line, an
  optional `Action` + `Action Input`, and an `Observation` fed back before the next Thought.

## Go deeper (agent loops & guardrails)
- **Agent loop implementations (LangChain / LlamaIndex agent loop docs).** How ReAct is operationalized
  in real frameworks: the runtime that emits a step, runs the tool, appends the observation, and decides
  whether to continue. Notice the step-kind signal (act vs. finish) that ends the loop, and where the
  framework puts the max-iterations cap.
- **Max-steps caps and agent guardrails ("don't let agents loop forever").** The practitioner writeups on
  bounding a loop. Notice the two-part discipline: a hard iteration cap *and* an honest can't-finish
  result (no answer, a step_limit reason) instead of a crash or a fabricated answer.
- **Structured logging & observability for agents.** Per-step logs of thought/action/observation as the
  operational record. Notice that an unlogged loop is undebuggable — the log is how you find the exact
  step where an agent drifted.
- **Tool-output validation.** Rejecting empty or malformed observations before feeding them back. Notice
  the symmetry with validating tool *inputs*: the agent is an untrusted consumer of tool results, so you
  check them at the boundary.

## Frontier — what to watch
- **Long-horizon single-agent reliability.** Work on why an agent's accuracy collapses over dozens of
  steps as early errors compound silently. Notice that guardrails *bound and surface* the failure but do
  not by themselves make the agent recover.
- **Automated error recovery in agent loops.** Research on detecting that a loop has gone off the rails
  and re-grounding or backing up. Notice this is much harder than bounding the loop, and is the active
  edge beyond the four guardrails this topic teaches.

## How to stay current on this topic
- Track agent-framework changelogs (LangChain, LlamaIndex) for changes to the loop, the iteration cap,
  and built-in logging — that is where new loop-reliability affordances land first.
- When a new agent-loop technique appears, ask: *does it bound the loop, ground the observation, or make
  the agent recover — and what eval proves it?* — the same lens the frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
- Cross-read the core topics [harness-engineering](../harness-engineering/) and
  [agent-guardrails-budgets](../agent-guardrails-budgets/) for the harness and budgets that host this loop.
