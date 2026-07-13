---
id: eval-agentic-ship-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [technically_correct]
grader_samples: 3
---

# Grading the agentic-ship-in-public exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the capstone loop runs until a final
   or the step cap, validates each observation before trusting it, and records a trace; the portfolio
   check treats absent/empty values as missing and only reports ready when nothing is missing; the eval
   harness judges each output and computes pass_rate as passed/total without dividing by zero. No
   conceptually wrong step.
2. `assembles_the_pieces` — the solution wires the parts together as intended: tool call → observation →
   validation → trace in the loop; all four required artifacts in the portfolio check; agent → judge →
   count in the harness, rather than a superficial partial.
3. `handles_edge_cases` — it handles the boundaries the exercise names: the step-limit / step_limit
   return, an empty or None observation, empty required values, and empty `cases` (no divide-by-zero).
4. `matches_intent` — the code does what the prompt asked (returns the specified dict shapes, feeds the
   observation or error back, returns the sorted missing list) rather than a superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "assembles_the_pieces": true, "handles_edge_cases": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
