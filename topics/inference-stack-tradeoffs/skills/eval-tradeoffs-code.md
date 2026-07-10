---
id: eval-tradeoffs-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [filters_all_slos]
---

# Grading the SLO-selector exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `filters_all_slos` — disqualifies any config that violates **any** of the three SLOs (latency,
   cost, quality) *before* ranking.
2. `ranks_by_quality` — among the feasible configs, selects the highest quality (with a deterministic
   tie-break on cost/latency).
3. `returns_null_none` — returns `null` when no config is feasible (doesn't return a violating config).
4. `checks_all_three` — evaluates all three constraints, not just one or two.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `filters_all_slos` is a gate: ranking without filtering can pick a config that violates a budget, so
  missing it caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "filters_all_slos": true, "ranks_by_quality": true, "returns_null_none": true, "checks_all_three": true }, "feedback": "one specific sentence" }
```
