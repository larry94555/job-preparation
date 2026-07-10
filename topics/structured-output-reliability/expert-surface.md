# Expert Surface — structured-output-reliability

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain why a probabilistic generator satisfying a rigid contract fails at a nonzero tail rate — `lessons/01-taxonomy.md`, `questions/essay.yaml`.
- ✅ **[L3]** Command the vocabulary: syntax vs. semantics, schema-as-contract, constrained decoding, bounded repair, fallback chain — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Name the structured-output failure classes (malformed, missing/extra field, wrong type, enum/constraint violation, truncation, hallucinated value) — `lessons/01-taxonomy.md`, `questions/mcq.yaml`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** Outlines (Willard & Louf, 2023) as the grammar/finite-state constrained-decoding origin — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** Instructor (Jason Liu), jsonformer, and provider "JSON mode" as schema-first structured-output tooling — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- 🟡 **[L4]** Semantic (not just syntactic) validity as the live open problem — named in `lessons/expert-context.md`/`deep-dive.md`; no dedicated business-rule-validation drill.
- 🟡 **[L4]** Quality effects of aggressive constraints (token-distribution steering) — named as a cost in `lessons/02-validation.md`/`deep-dive.md`; not measured or drilled.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five levers (prevention, contract, recovery, degradation, observability) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a structured-output design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a design and rate it toy/prototype/demo/production against the 5-point checklist — `lessons/deep-dive.md`, `questions/deep-dive.yaml` (code-review MCs).
- ✅ **[L3]** Design the fallback chain (constrained decode → validate → bounded repair → simpler schema → default → human) as a cost gradient — `lessons/03-repair-fallback.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Classify an observed bad output into its failure class and route it (parser vs. validator vs. repair) — `lessons/01-taxonomy.md`, `exercises/classify-failure`, `questions/code.yaml`.
- ✅ **[L3]** Diagnose truncation to the output-token limit rather than the model "giving up" — `lessons/01-taxonomy.md`, `questions/free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement parse-then-validate structured extraction against a schema — `exercises/get-structured`, `questions/code.yaml`.
- ✅ **[L4]** Debug a fragile JSON-extraction implementation (regex-scrape / eval antipattern) — `exercises/extract-json-debug`, `questions/deep-dive.yaml`.
- ⬜ **[L4]** Wire a real constrained-decoding library (Outlines / GBNF / provider JSON mode) end-to-end — taught conceptually in `lessons/02-validation.md`; no hands-on library exercise yet.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Zod/Pydantic/Ajv, Outlines, Instructor, llama.cpp GBNF as the structured-output stack — `lessons/expert-context.md`, `deep-dive.md`.
- 🟡 **[L3]** Log and classify failures (malformed/missing/type/enum/truncation) to decide prevention-vs-repair investment — discussed in `lessons/deep-dive.md`; not drilled as an observability/metrics exercise.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Track where the frontier moves (semantic validity, constraint quality cost, new constrained-decoding runtimes) — pointers in `lessons/expert-context.md`; curated `reading-list.md` (WS5).

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags (validate-on-top-of-constrained-decoding; regex-scraping / "usually valid JSON" / unbounded repair) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a repair + fallback chain under questioning — `questions/essay.yaml` `essay-so-interview`, `questions/expert.yaml` interview items.

## Coverage summary
20 items · ✅ 16 covered · 🟡 3 partial · ⬜ 1 gap. Weighted coverage (covered=1, partial=0.5) ≈ **88%**.
Open frontier work: a hands-on constrained-decoding library exercise (the one hard gap), a
semantic/business-rule validation drill, a measured constraint-quality-cost exercise, and a
failure-classification observability drill.

<!-- coverage: items=20 covered=16 partial=3 gap=1 -->
