---
id: eval-cost-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [per_success_uses_successes]
---

# Grading the cost-aggregator exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `per_success_uses_successes` — cost-per-success divides by the **success count**, not by the
   request count or token count.
2. `zero_guard` — returns `null` (not `NaN`) when a feature has zero successes.
3. `groups_by_feature` — buckets records by feature and sums each bucket's cost.
4. `total_correct` — `total` is the sum of every record's cost.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `per_success_uses_successes` is a gate: dividing by requests instead of successes caps the verdict
  below pass because it defeats the whole point of the metric.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "per_success_uses_successes": true, "zero_guard": true, "groups_by_feature": true, "total_correct": true }, "feedback": "one specific sentence" }
```
