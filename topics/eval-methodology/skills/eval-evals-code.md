---
id: eval-evals-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [gate_on_threshold]
---

# Grading the eval-gate exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `gate_on_threshold` — `passed` is true **iff** `passRate >= threshold` (it actually consults the
   threshold rather than being hard-coded or ignoring it).
2. `computes_pass_rate` — passRate = passing / total cases.
3. `matches_expected` — a case passes by comparing `run(input)` to `expected`.
4. `reports_failures` — collects the **names** of the failing cases.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `gate_on_threshold` is a gate: a gate that ignores its threshold isn't a gate.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "gate_on_threshold": true, "computes_pass_rate": true, "matches_expected": true, "reports_failures": true }, "feedback": "one specific sentence" }
```
