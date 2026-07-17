---
title: "Guarantees and best efforts in the contract stack"
order: 2
covers:
  - mc-schema-description
  - expert-mcp
  - mc-shape-vs-semantics
  - mc-default-antipattern
---
## Guarantees and best efforts in the contract stack

**In brief.** Current practice stacks typed tool contracts, the tool loop, constrained structured
outputs, and validate-and-recover. Each layer gives either a **hard guarantee** or a **best effort**,
and knowing which is which — plus what no layer gives you — is what separates a contract you can rely on
from one you only hope holds.

**The layers.**

- **The schema is the model's entire view of the tool** — the model never sees your source code. It
  targets the `input_schema`: types, the `required` list, and the natural-language **descriptions**.
  Types and `required` are a hard gate the harness enforces before anything runs. The description is a
  best effort: it is how the model decides **when** to reach for the tool and how to fill its arguments.
  A precisely typed schema with vague prose still gets called wrong — the types were never the part that
  chose the tool.
- **MCP — Model Context Protocol (Anthropic, 2024)** — the open standard for the tool **boundary**: a
  common interface between models or agents and tools, so a tool implemented once is usable across hosts
  instead of re-wired per vendor. It standardizes **where the contract lives**, collapsing discovery,
  scoping, and validation to one shared seam. It is an interface standard — not a validator, not a
  decoding mode, not a benchmark.
- **Constrained decoding guarantees shape, not semantics** — a JSON-schema structured-outputs mode
  restricts the decoder at each step to tokens consistent with the schema, so the output is
  **guaranteed** to parse and match the shape. That guarantee stops at shape. It says nothing about a
  `confidence` landing inside `[0, 1]` or a findings list being non-empty — the value-level semantics a
  schema cannot fully express. So the two layers are complementary, not redundant: constrained decoding
  gets you a parseable object, a validator like Pydantic gets you a **correct** one.
- **The gate is a gate, not a suggestion** — when a check fails, the only safe move is to reject with a
  model-facing error and let the model resupply. Silently defaulting a missing required field runs the
  tool on a value the model never chose, hides the mistake, and risks a wrong side effect. Guessing the
  closest real tool for a hallucinated name and blindly coercing a string to a number are the same error
  in different clothes: all three **execute unvalidated input**, turning a recoverable step into a bug.

**Why it matters.** Naming the layer that gives a guarantee versus the one making a best effort is what
reads as senior — and it is what stops you trusting a description to enforce correctness, a decoding
mode to check a range, or a default to paper over a contract the model actually failed to meet.
