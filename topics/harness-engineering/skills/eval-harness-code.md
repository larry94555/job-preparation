---
id: eval-harness-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [duplicate_call_guard]
---

# Grading the harness-loop exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `duplicate_call_guard` — stops when the current action equals the previous one (same action twice
   in a row).
2. `max_steps_budget` — a hard step cap guarantees termination even if nothing else fires.
3. `stops_on_done` — stops with "complete" when a step reports done.
4. `returns_reason` — reports *why* it stopped (`complete` / `budget` / `duplicate-call`).

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `duplicate_call_guard` is a gate here (it's the harness-specific guard this exercise teaches), so
  missing it caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "duplicate_call_guard": true, "max_steps_budget": true, "stops_on_done": true, "returns_reason": true }, "feedback": "one specific sentence" }
```
