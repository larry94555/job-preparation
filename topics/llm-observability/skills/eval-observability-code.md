---
id: eval-observability-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [recurses_children]
---

# Grading the token-rollup exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `recurses_children` — recurses into child spans (calls itself / walks all depths), not just the
   direct children.
2. `includes_own_tokens` — adds the span's own `tokens`.
3. `sums_all_depths` — the total accounts for descendants at every level.
4. `handles_leaf` — a span with no children returns its own tokens (base case).

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `recurses_children` is a gate: summing only one level misses nested spans, so missing it caps the
  verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "recurses_children": true, "includes_own_tokens": true, "sums_all_depths": true, "handles_leaf": true }, "feedback": "one specific sentence" }
```
