---
id: eval-quant-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [clamps_uint8]
---

# Grading the int8-quantization exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `clamps_uint8` — quantized codes are clamped to `[0, 255]` integers (an out-of-range code would
   overflow/corrupt the tensor).
2. `computes_scale` — scale = (max − min) / 255.
3. `zero_range_guard` — handles `max === min` without dividing by zero (constant tensor reconstructs).
4. `dequant_inverts` — dequantize is `(q − zeroPoint) * scale`, inverting the quantization.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `clamps_uint8` is a gate: unclamped codes silently corrupt values, so missing it caps the verdict
  below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "clamps_uint8": true, "computes_scale": true, "zero_range_guard": true, "dequant_inverts": true }, "feedback": "one specific sentence" }
```
