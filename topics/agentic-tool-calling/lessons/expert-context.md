# Tool calling & structured outputs — expert context

## The tool-calling canon

Agent tool calling has a short, nameable canon — the work that turned "the model can emit a function
call" into an engineering discipline you can standardize and guarantee.

- **OpenAI function calling (2023)** put tool use into the mainstream API: you declare functions with a
  JSON-schema signature, and the model returns a structured call (name + arguments) instead of prose.
  This established the pattern of a *typed tool signature the model targets* rather than free text.
- **Anthropic tool use** generalized the same idea into the message loop this topic teaches: the model
  returns a `tool_use` block with a `tool_name` and `tool_input`, the harness runs it, and the output
  goes back as a `tool_result` block keyed by `tool_use_id`. The model is the caller; the harness is the
  untrusting executor.
- **MCP — Model Context Protocol (Anthropic, 2024)** is the open standard for the *tool boundary*: a
  common interface between models/agents and tools, so a tool implemented once is usable across hosts
  instead of re-wired per vendor. It standardizes *where the contract lives* — discovery, scoping, and
  validation collapse to one shared seam.

Alongside the tool loop sits the second half of reliability: **structured outputs**. Provider
**JSON / structured-outputs modes** constrain decoding to a JSON schema so the returned text is
*guaranteed* to parse and match the shape, rather than prompting for JSON and hoping. In Python,
**Pydantic** is the standard validator for turning that JSON into a typed object and failing loudly on
anything malformed. Current practice is: typed tool contracts + the tool loop + constrained structured
outputs + validate-and-recover. Knowing this canon — and which layer gives a *guarantee* versus a
*best effort* — is what reads as senior.
