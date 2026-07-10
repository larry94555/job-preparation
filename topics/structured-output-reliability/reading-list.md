# Reading list & staying current — structured-output-reliability

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **Outlines — Willard & Louf (2023).** The paper that reframed structured generation as *finite-state
  constrained decoding*: compile the schema/grammar into an automaton and mask the logits so only
  contract-valid tokens can be sampled. Notice that validity becomes a property of *decoding*, not a
  post-hoc check — this is the single most important read for the topic.
- **Provider "JSON mode" / structured outputs.** The productized form of the same idea: the runtime
  guarantees syntactically valid JSON (and, with schema-constrained variants, a shape). Notice what it
  does *not* guarantee — semantic correctness — which is why validation still sits on top.

## Go deeper (mechanism & the validation layer)
- **Instructor — Jason Liu.** The library that popularized *schema-first* extraction: define the shape
  (Pydantic/Zod), let the model fill it, validate, and retry on failure. Notice how it wraps
  constrained decoding, validation, and bounded repair into one ergonomic loop.
- **jsonformer.** An early structured-decoding approach that fills a JSON skeleton field-by-field.
  Notice the same core move as grammar-constrained decoding — the model only ever chooses *values*,
  never the structural tokens — arrived at from the templating side.
- **llama.cpp GBNF grammars.** Grammar-constrained decoding you can read as a concrete artifact: a BNF
  grammar drives the token mask at inference time. Notice this is the same finite-state idea Outlines
  formalizes, exposed as a knob in a local runtime.
- **Zod / Pydantic as schema-as-contract.** The schema is the executable contract, not documentation.
  Notice that these validate *after* decoding — they catch type, enum, and constraint violations that a
  syntax-only guarantee lets through, and they define what "valid" even means.

## Frontier — what to watch
- **Semantic (not just syntactic) validity.** The open problem: constrained decoding guarantees a
  well-formed shape, but not that the values satisfy business rules (dates in range, IDs that exist,
  fields that agree). Watch for approaches that push validation of *meaning* into or alongside the
  decode loop, rather than only after it.
- **Quality effects of aggressive constraints.** Heavy grammar/masking steers the token distribution
  and can degrade the answer's content even while making it parse. Watch for eval-gated adoption that
  measures the quality cost, not blanket "it always returns valid JSON" claims.

## Tools & implementations worth reading
- **Outlines, Instructor, jsonformer, llama.cpp GBNF, Zod/Pydantic** — the structured-output stack.
  Reading Outlines' automaton construction next to a GBNF grammar file is the fastest way to turn the
  constrained-decoding idea into a mental model of real code; reading an Instructor retry loop shows
  how validate-repair-fallback is wired in practice.

## How to stay current on this topic
- Follow the **Outlines, Instructor, and llama.cpp** repos and release notes — new constrained-decoding
  runtimes and grammar features land in code first.
- Track **provider structured-output docs** (JSON mode / schema-constrained outputs) — the guarantees,
  and their limits, shift with each model and API revision.
- When a new constrained-decoding technique appears, ask the three canon questions: *what does it trade
  (quality vs. guaranteed shape), what regime does it win in, and what eval proves the quality cost is
  acceptable?* — the same lens the deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
