---
id: eval-failuremodes-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [bounded_attempts]
---

# Grading the runSafely exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `bounded_attempts` — the retry loop runs **at most** `maxAttempts` times; there is no unbounded loop.
2. `all_guards_pass` — an output is accepted only when it passes **every** guard.
3. `returns_fallback` — when the budget is exhausted, returns the fallback with `ok:false` (never throws).
4. `reports_outcome` — reports whether the real output or the fallback was used (the `ok` flag / attempts).

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `bounded_attempts` is a gate: an unbounded retry is itself the runaway failure, so missing it caps
  the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "bounded_attempts": true, "all_guards_pass": true, "returns_fallback": true, "reports_outcome": true }, "feedback": "one specific sentence" }
```
