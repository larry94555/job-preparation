# Expert context: papers, frontier & interview

## Papers people and the frontier

Structured-output reliability is a practitioner topic, and its canon is a short list of libraries and
techniques you should be able to name and place in an interview:

- **Outlines** (Willard & Louf, 2023) popularized **grammar / finite-state constrained decoding**:
  it masks the token distribution at each step so generation *cannot* leave the supplied grammar. This
  is the load-bearing idea behind "the JSON is always well-formed" — the shape is guaranteed by
  construction, not by luck.
- **Instructor** (Jason Liu) and **jsonformer** are the structured-output libraries that made
  schema-first extraction ergonomic — you declare the target type and get validated objects back
  rather than hand-parsing strings.
- Providers now ship **"JSON mode" / structured outputs** natively, so a schema can be enforced at the
  API boundary. Underneath, this is the same constrained-decoding idea productized.
- **llama.cpp GBNF grammars** bring grammar-constrained decoding to local inference.

Tools you'd reference for the validation half: **Zod** and **Pydantic** as the schema/validation
layer, plus **Outlines** and **Instructor** on the generation side. Current SOTA is a stack:
**constrained decoding + schema validation + bounded repair + fallback chains**. The open problems
experts still argue about are **semantic (not just syntactic) validity** — a grammar can guarantee the
JSON parses and matches the schema shape while the *values* are still wrong — and the **quality
effects of aggressive constraints**, since over-restricting the token distribution can steer the model
away from better completions.

## Interviewing on structured output reliability

What a strong interviewer probes here:

- **Do you validate even when you use constrained decoding?** The senior answer is yes: constrained
  decoding gives you syntax and shape, not meaning. You still parse-then-validate against an explicit
  schema (Zod/Pydantic) because values can be out of range, violate enums, or break business rules.
- **Can you design a repair / fallback chain?** A strong candidate lays out
  constrained-decode → validate → **bounded** repair (feed the validation error back, capped attempts)
  → simpler schema → deterministic default → human, and explains why each step is ordered by cost.

**Red flags** that sink candidates: **regex-scraping JSON** out of the response, saying **"the model
usually returns valid JSON"** as if a nonzero tail failure rate disappears at scale, and **unbounded
repair** loops with no cap on attempts, latency, or cost. Asked to design a structured-output
pipeline, lead with prevention (constrained decoding / provider JSON mode), then the **schema as the
contract** (parse-then-validate), then a **bounded repair loop**, then an explicit **fallback chain** —
and name **Outlines** for constrained decoding and **Instructor/Pydantic/Zod** as the tooling.
Knowing the canon *and* insisting on validation on top of constrained decoding is what reads as senior.
