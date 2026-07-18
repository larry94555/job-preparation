---
id: eval-loop-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [no_progress_guard]
---

# Grading the bounded-loop exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `no_progress_guard` — stops with `"no-progress"` when the observed state is unchanged from the
   previous step (the loop is stuck).
2. `max_steps_budget` — a hard `maxSteps` cap guarantees termination even if nothing else fires.
3. `stops_on_done` — returns `"done"` when a step reports done, and `"done"` takes precedence over the
   budget cap.
4. `returns_reason` — reports **why** it stopped (`done` / `no-progress` / `budget`), not a bare step
   count.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `no_progress_guard` is a gate (it's the loop-specific guard this exercise teaches), so missing it
  caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "no_progress_guard": true, "max_steps_budget": true, "stops_on_done": true, "returns_reason": true }, "feedback": "one specific sentence" }
```
