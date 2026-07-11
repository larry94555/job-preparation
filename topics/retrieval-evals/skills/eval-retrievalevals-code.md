---
id: eval-retrievalevals-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [correct_denominators]
---

# Grading the retrieval-metrics exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the extracted evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `correct_denominators` — recall divides by the **relevant-set size** and precision divides by
   **k** (two different denominators, not one shared variable).
2. `mrr_first_relevant` — MRR is `1 / rank` of the **first** relevant item, and `0` when none appear.
3. `guards_zero_division` — no `NaN`/crash when the relevant set is empty (guards the divide).
4. `uses_membership` — uses a Set / membership test for hits rather than nested scans.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `correct_denominators` is a gate: getting the denominators wrong caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "correct_denominators": true, "mrr_first_relevant": true, "guards_zero_division": true, "uses_membership": true }, "feedback": "one specific sentence" }
```
