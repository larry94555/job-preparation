---
id: eval-batching-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [refills_on_completion]
---

# Grading the continuous-batching exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `refills_on_completion` — when a request finishes, its slot is freed and a waiting request is
   admitted **immediately** (not after the whole batch clears). This is what makes it *continuous*.
2. `one_token_per_step` — each active request emits exactly one token per step.
3. `respects_batch_size` — the active set never exceeds `batchSize`.
4. `terminates_correctly` — the loop ends when all requests are done and returns the final step count.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `refills_on_completion` is a gate: without mid-batch refill it's static batching, not continuous, so
  missing it caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "refills_on_completion": true, "one_token_per_step": true, "respects_batch_size": true, "terminates_correctly": true }, "feedback": "one specific sentence" }
```
