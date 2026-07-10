---
id: eval-prefill-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [phases_not_mixed]
---

# Grading the latency-model exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `phases_not_mixed` — TTFT depends on **prompt** length only and decode on **output** length only;
   the two phases aren't blended into one rate.
2. `ttft_from_prefill` — ttft = promptTokens / prefillRate.
3. `decode_from_output` — decode = outputTokens * tpot.
4. `total_is_sum` — total = ttft + decode.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `phases_not_mixed` is a gate: mixing prompt and output defeats the point of a phase-aware model, so
  missing it caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "phases_not_mixed": true, "ttft_from_prefill": true, "decode_from_output": true, "total_is_sum": true }, "feedback": "one specific sentence" }
```
