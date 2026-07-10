---
id: eval-guardrails-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [enforces_budget]
---

# Grading the bounded-loop exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `enforces_budget` — the loop **cannot** exceed `maxSteps`; there is a hard step cap (not just a
   done check). This is the guarantee-of-termination backstop.
2. `detects_no_progress` — stops when a step returns a state equal to the previous state.
3. `stops_on_done` — stops with "complete" when the step reports done.
4. `returns_reason` — reports *why* it stopped (`complete` / `budget` / `no-progress`).

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `enforces_budget` is a gate: a loop with no step cap is the runaway-agent failure, so missing it
  caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "enforces_budget": true, "detects_no_progress": true, "stops_on_done": true, "returns_reason": true }, "feedback": "one specific sentence" }
```
