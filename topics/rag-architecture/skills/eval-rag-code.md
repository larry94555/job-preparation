---
id: eval-rag-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [rrf_formula]
---

# Grading the RRF exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `rrf_formula` — each list contributes `1 / (k + rank)` with a **1-based** rank (not `1/rank`,
   not the raw score).
2. `sums_across_lists` — scores are accumulated across every list a document appears in.
3. `includes_partial` — a document present in only some lists is still included and scored.
4. `sorted_descending` — results are sorted by total score descending (deterministic tie-break is a plus).

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `rrf_formula` is a gate: the wrong contribution term caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "rrf_formula": true, "sums_across_lists": true, "includes_partial": true, "sorted_descending": true }, "feedback": "one specific sentence" }
```
