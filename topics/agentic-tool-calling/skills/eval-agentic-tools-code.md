---
id: eval-agentic-tools-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [technically_correct]
---

# Grading the agentic-tool-calling exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the tool loop continues on
   `tool_use` and returns on `end_turn` with a step cap; the parser validates types and range before
   returning; the dispatcher rejects an unknown tool and validates before running the handler. No
   conceptually wrong step.
2. `validates_input` — the solution checks its inputs (argument/field types, ranges, tool existence)
   before acting on them, rather than trusting them blindly.
3. `handles_errors` — bad input produces a structured error or a raised `ValueError` as the exercise
   requires, instead of crashing unexpectedly or silently continuing.
4. `matches_intent` — the code does what the prompt asked (fed the tool result back, returned the
   handler value, raised on the right violations) rather than a superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "validates_input": true, "handles_errors": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
