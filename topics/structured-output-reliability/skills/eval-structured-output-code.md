---
id: eval-structured-output-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [has_fallback]
---

# Grading the structured-output coding exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts, using the evidence the engine provides: the test result and
the static signals for `must_use` / `avoid_antipattern`.

You are given:

- `tests_passed`: boolean.
- `signals.must_use`: which required elements were detected (e.g. schema validation, bounded retry, fallback).
- `signals.avoid_antipattern`: which antipatterns were detected (e.g. unbounded loop, regex JSON scraping).

## Checks (each true/false)

1. `validates_against_schema` — Parses then validates against the provided schema (not regex scraping).
2. `repair_is_bounded` — Any retry loop has an explicit maximum; it cannot loop forever.
3. `has_fallback` — Returns a safe fallback when validation ultimately fails (where the task requires one).
4. `no_antipatterns` — None of the listed antipatterns are present.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `>= 3` checks true → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{
  "checks": { "validates_against_schema": true, "repair_is_bounded": true, "has_fallback": true, "no_antipatterns": true },
  "feedback": "one specific sentence"
}
```
