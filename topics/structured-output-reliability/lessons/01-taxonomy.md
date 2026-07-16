# Structured output: what goes wrong

## Why structured output fails

When you ask an LLM for JSON (or any structured format), you are asking a *probabilistic* text
generator to satisfy a *rigid* contract. Most of the time it complies — but "most of the time" is
not a production guarantee. At scale, a small failure rate becomes a steady stream of broken
responses, so the first job is to **name the ways it fails** so you can detect and handle each.

A key distinction runs through everything: **syntax vs. semantics**.
- *Syntax*: is the text even parseable as the format (valid JSON)?
- *Semantics*: given that it parses, does it match your schema — the right fields, types, and values?

These fail independently and are caught by different tools (a parser vs. a schema validator).

## The failure classes

The common structured-output failures:

- **Malformed output** — not parseable at all (a stray comma, an unquoted key, prose wrapped around
  the JSON). Caught by the *parser*.
- **Missing / extra fields** — parses, but the shape is wrong. Caught by the *schema validator*.
- **Wrong types** — a number where a string is required, `"true"` instead of `true`.
- **Constraint / enum violations** — a value outside the allowed set (e.g. a `status` that isn't one
  of your enum values). It parses and the field exists — the *value* is illegal.
- **Truncation** — the response is cut off mid-structure (see below).
- **Hallucinated values** — plausible-looking but fabricated content.

Notice that only the first is a *syntax* failure; the rest are *semantic* and only a schema — not a
JSON parser — will catch them.

## Truncation

Truncation is common enough to call out on its own. If a response ends mid-object, the usual cause is
not the model "giving up" — it is hitting the **output length limit** (`max_tokens` or the equivalent
output cap). The fix is to raise the output-token budget or reduce how much you ask for; a validator
should also *detect* truncation and route it into repair rather than passing a half-object downstream.

Naming these classes is the foundation for everything that follows: you can only detect, log, and
recover from a failure once you can say precisely which kind it is.
