---
id: eval-routing-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [fallback_on_error]
---

# Grading the router exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `fallback_on_error` — when a provider throws, the router catches it and tries the **next** provider
   (it doesn't propagate the error).
2. `tries_in_order` — providers are attempted in the given order; the first success is returned.
3. `breaker_skips_open` — a provider whose consecutive failures reached the threshold is **skipped**
   (not called) until it recovers; a success resets its count.
4. `returns_all_failed` — when everything fails, returns a structured `all_failed` rather than throwing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `fallback_on_error` is a gate: a router that doesn't fall back isn't a router, so missing it caps
  the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "fallback_on_error": true, "tries_in_order": true, "breaker_skips_open": true, "returns_all_failed": true }, "feedback": "one specific sentence" }
```
