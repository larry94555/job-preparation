---
id: eval-specdec-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [stops_at_first_reject]
---

# Grading the accepted-tokens exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `stops_at_first_reject` — stops counting at the first `false`; matches *after* a reject are not
   counted (the draft has diverged from the target's path).
2. `counts_leading_matches` — counts the run of leading `true`s before that.
3. `adds_one_bonus` — adds exactly 1 for the token the target always emits (so a fully-rejected draft
   returns 1, never 0).

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `stops_at_first_reject` is a gate: counting past a reject is semantically wrong, so missing it caps
  the verdict below pass.
- `>= 2` of 3 checks true (with the gate) → **pass**; else follow the standard bands.

## Output — JSON only

```json
{ "checks": { "stops_at_first_reject": true, "counts_leading_matches": true, "adds_one_bonus": true }, "feedback": "one specific sentence" }
```
