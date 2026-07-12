# Reading list & staying current — agentic-tool-calling

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **OpenAI function calling (2023).** The API change that put tool use into the mainstream: declare a
  function with a JSON-schema signature and the model returns a structured call instead of prose. Notice
  the reframing — the model targets a *typed contract*, and the surrounding program is the executor.
- **Anthropic tool use (Claude tool use docs).** The tool loop this topic teaches: the model returns a
  `tool_use` block (name + input), the harness runs it, and the result goes back as a `tool_result`
  keyed by `tool_use_id`. Notice `stop_reason == "tool_use"` means *continue the loop*, not *stop*.

## Go deeper (schemas, validation & structured outputs)
- **Pydantic docs (validation & `model_validate_json`).** The Python standard for turning model JSON into
  a typed object and failing loudly on anything malformed. Notice that well-formed JSON is not correct
  JSON — you validate types and ranges even when the output *looks* fine.
- **Structured outputs / JSON mode (provider `response_format` / JSON-schema modes).** Constrained
  decoding that *guarantees* the output matches a schema. Notice the difference from prompting for JSON
  and hoping: the decoder is restricted to schema-valid tokens, so shape is guaranteed while semantic
  validation still matters.
- **Model Context Protocol (MCP) — Anthropic (2024).** The open standard for the tool boundary; treat it
  as the interface hosts and agents are converging on. Notice it standardizes *where the contract lives*,
  so a tool is discovered, scoped, and validated once instead of re-wired per vendor.

## Frontier — what to watch
- **ReAct — Yao et al. (2022).** The reasoning-and-acting loop (think, act via a tool, observe, repeat)
  that underpins the agent loop. Notice it is the conceptual ancestor of the `tool_use → execute →
  tool_result` cycle.
- **Toolformer — Schick et al. (Meta, 2023).** Framed tool use as a *learnable* capability — a model
  deciding when and how to call an API. Notice the durable takeaway: the model is a *caller* of
  contracts, the harness is the executor/validator.
- **Gorilla & the Berkeley Function-Calling Leaderboard (BFCL) — Patil et al. (Berkeley, 2023).** Making
  tool-calling reliability measurable across models. Notice *what* it scores — argument correctness and
  call structure, not vibes — and that later versions push toward multi-turn / agentic evaluation.

## How to stay current on this topic
- Follow **MCP** spec and server releases — the tool-boundary standard is where new reliability
  affordances land first.
- Track the **Berkeley Function-Calling Leaderboard** and provider tool-calling changelogs for parallel/
  streaming tool calls and multi-tool orchestration results.
- When a new tool-calling technique appears, ask: *what does it guarantee vs. merely encourage, what
  does it trade, and what eval proves it?* — the same lens the frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
