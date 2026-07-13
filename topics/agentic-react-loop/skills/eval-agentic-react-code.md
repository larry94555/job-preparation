---
id: eval-agentic-react-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [technically_correct]
grader_samples: 3
---

# Grading the agentic-react-loop exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the ReAct loop continues on an
   `action` step and returns on a `final` step with a max-steps cap and a `step_limit` result; the
   observation validator accepts non-empty content and rejects empties; the parser extracts Thought and
   the optional Action/Action Input. No conceptually wrong step.
2. `handles_limits` — the solution respects the loop's bounds: it caps iterations with `max_steps` and
   returns the structured `step_limit` result when the cap is reached, rather than spinning or crashing.
3. `validates_output` — the solution checks observations/fields before acting on them (rejecting empty
   observations, handling a missing Action line) rather than trusting them blindly.
4. `matches_intent` — the code does what the prompt asked (feeds the observation back, returns the
   answer on a final, returns the required dict shape) rather than a superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "handles_limits": true, "validates_output": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
