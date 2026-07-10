---
id: eval-context-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [respects_budget]
---

# Grading the context-assembler exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `respects_budget` — the running total of included sections never exceeds `tokenBudget`.
2. `sorts_by_priority` — sections are ranked by priority (highest first) before fitting.
3. `keeps_scanning` — after a section that doesn't fit is skipped, scanning continues so a smaller
   lower-priority section can still be included.
4. `returns_included_ids` — returns the ids of the included sections (in priority order).

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `respects_budget` is a gate: overflowing the budget defeats the point of the assembler, so missing
  it caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "respects_budget": true, "sorts_by_priority": true, "keeps_scanning": true, "returns_included_ids": true }, "feedback": "one specific sentence" }
```
