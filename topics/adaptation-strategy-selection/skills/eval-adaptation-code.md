---
id: eval-adaptation-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [freshness_first_rag]
---

# Grading the choose-strategy exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `freshness_first_rag` — `freshness` OR `attribution` is checked **first** and returns `"rag"`, so a
   volatile-facts requirement never resolves to fine-tuning.
2. `behavior_finetune` — a behavior/format change (without freshness) returns `"fine-tuning"`.
3. `latency_distill` — a low-latency need (without the above) returns `"distillation"`.
4. `default_incontext` — the fall-through default is `"in-context"`.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `freshness_first_rag` is a gate: it encodes the antipattern fix (don't fine-tune for facts), so
  missing it caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "freshness_first_rag": true, "behavior_finetune": true, "latency_distill": true, "default_incontext": true }, "feedback": "one specific sentence" }
```
