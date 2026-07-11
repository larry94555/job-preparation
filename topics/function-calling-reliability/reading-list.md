# Reading list & staying current — function-calling-reliability

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **Toolformer — Schick et al. (Meta, 2023).** The paper that framed tool use as a *learnable* capability:
  a model deciding when and how to call an API rather than being hard-scripted. Notice that the model is a
  caller of contracts, not the executor — the seed of every reliability concern downstream.
- **Gorilla — Patil et al. (Berkeley, 2023).** Teaching a model to emit correct API calls across a large,
  shifting universe of tools. Notice the failure mode it surfaces: hallucinated or malformed calls, which is
  exactly what typed contracts and validate-and-reject exist to catch.

## Go deeper (contracts, validation & idempotency)
- **Berkeley Function-Calling Leaderboard.** The evaluation that made tool-calling reliability measurable
  across models. Notice *what* it scores — argument correctness and call structure, not vibes — and use it as
  the mental model for how you'd regression-test your own dispatcher.
- **Typed contracts + argument validation (Pydantic / Zod validators).** The load-bearing engineering lever:
  validate every argument against the schema before you execute, and reject with a model-facing error. Notice
  that constrained/typed output is necessary but not sufficient — you validate even when the call *looks* well-formed.
- **Idempotency & read/write separation.** The pattern that makes retries safe: idempotency keys for writes,
  and separating read tools (safe to auto-run/retry) from mutating tools (guarded, deduplicated). Notice this is
  the difference between a retry and a double-charge.

## Frontier — what to watch
- **Model Context Protocol (MCP) — Anthropic (2024).** The open standard for the tool boundary; treat it as the
  interface every host/agent is converging on. Notice it standardizes *where* the contract lives, which reshapes
  how tools are discovered, scoped, and validated at scale.
- **Reliable multi-tool orchestration & robust argument grounding.** The open problem: chaining many tools while
  keeping arguments grounded in real state. Watch for eval-gated claims, not demos — orchestration failures are
  silent and compound.
- **Exactly-once at scale.** The hard distributed-systems edge of idempotency: making a mutating tool call happen
  once under retries, hedging, and partial failure. Watch for how systems push idempotency keys end-to-end.

## Tools & implementations worth reading
- **MCP servers + provider tool/function APIs + Pydantic/Zod validators** — the practical stack. Reading a real
  MCP server plus a strict validator is the fastest way to turn the papers into a mental model of a dispatcher:
  reject unknown tools, validate args, dedupe by idempotency key, execute.

## How to stay current on this topic
- Follow **MCP** spec and server releases — the tool boundary standard is where new reliability affordances land first.
- Track the **Berkeley Function-Calling Leaderboard** and provider tool-calling changelogs for parallel/streaming
  tool calls and orchestration eval results.
- When a new tool-calling technique appears, ask the three canon questions: *what does it trade (reliability/latency/
  cost), what regime does it win in, and what eval proves it?* — the same lens the deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **Toolformer's *thesis* (tool use is learnable) aged well; its *recipe* did not become the deployed path.**
  Production tool use converged on instruction-tuned / RLHF'd **native function calling** baked into the
  models by providers, not on Toolformer's specific self-supervised annotation method. The lasting takeaway is
  the boundary — model as *caller* of contracts, harness as *executor/validator*.
- **Gorilla's retrieval-augmented grounding aged better than "just fine-tune on APIs."** The durable idea is
  conditioning the model on retrieved API signatures at inference time (so it adapts to changing/version-shifting
  tools without memorizing them) — a pattern that persisted even as the standalone LLaMA-based Gorilla model
  was overtaken by native tool-calling in frontier models.
- **BFCL succeeded and stuck as *the* reliability yardstick, and evolved with the field.** It made
  argument-correctness and call-structure measurable across models and now distinguishes native FC from
  prompt-based workarounds; it has since expanded from single tool calls toward multi-turn / agentic
  evaluation (BFCL V4), tracking where the hard problems actually moved.
- **MCP aged from a bet into a de-facto standard fast.** Announced by Anthropic on 2024-11-25, it was adopted
  across the industry within months (OpenAI in early 2025, Google DeepMind shortly after), validating the
  canon's "the interface every host/agent is converging on" framing — the tool boundary standardized roughly
  as predicted.
- **The unglamorous engineering — typed contracts, argument validation, idempotency — aged as the real
  reliability lever.** Even with native tool calling and constrained output, validate-and-reject plus
  idempotency keys remained necessary; the open edges (multi-tool orchestration, exactly-once at scale) are
  still where failures are silent and compounding, exactly as flagged.
