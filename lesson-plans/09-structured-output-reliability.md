# 9. Structured output failures, schema validation, repair loops, fallback chains — Lesson-Plan Breakdown

**Slug:** `structured-output-reliability` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Make models emit valid, schema-conformant data reliably — and recover when they don't —
via validation, targeted repair, and layered fallbacks.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** failure taxonomy; constrained decoding/grammars; parse-then-validate; bounded repair loops; fallback chains; idempotency/budgets.
- **Key terms:** JSON Schema, grammar/constrained decoding, `response_format`/structured outputs, repair loop, fallback chain, coercion.
- **Tradeoffs:** constrained decoding guarantees syntax not semantics; repair cost/latency vs. give-up; strict vs. lenient schema.
- **Patterns:** validate→repair(bounded)→fallback; simplify-schema fallback; deterministic default. **Antipatterns:** regex-scraping JSON; unbounded repair; no validation "because constrained decoding."
- **Architectures:** grammar-constrained serving; app-side validate/repair wrapper.
- **Papers/posts:** grammar-constrained decoding (GBNF/Outlines, Willard 2023); provider structured-output docs. *(verify)*
- **People/canon:** Outlines/Willard; jsonformer; Instructor (Jason Liu).
- **Benchmarks/metrics:** valid-output rate, repair attempts to success, schema-conformance, end-to-end success.
- **Tools/OSS/models:** Zod/Pydantic, Outlines, Instructor, jsonformer, llama.cpp GBNF, provider JSON mode.
- **Open problems:** semantic (not just syntactic) validity; constrained decoding quality effects.
- **Interview signals:** do you validate even with constrained decoding; can you design a repair/fallback chain.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Failure taxonomy of structured output | T1 | L2→L3 | C1.3, C3.2 | MC, Cloze, FE |
| LP2 | Prevention: constrained decoding & its limits | T1 | L3 | C3.3, C2.1 | MC, Essay |
| LP3 | Schema as contract: parse-then-validate | T1 | L3 | C5.1, C5.3 | MC, Code |
| LP4 | Bounded repair loops | T1 | L3 | C3.3, C5.2 | Code |
| LP5 | Fallback chains & budgets | T2 | L3 | C3.3, C4.3 | Essay, Code |
| LP6 | Build `getStructured()` end-to-end | T2 | L3 | C5.2, C5.4 | Code |
| LP7 | Interview craft: reliability storytelling | T1✶ | L3 | C1.2, C8.3 | Essay |

✶ career slice. **Prereqs:** LP1 gates; strongly links to topic 10; ideal **pilot topic** (concrete + code-friendly).
