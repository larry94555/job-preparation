---
id: eval-agentic-eval-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
grader_samples: 3
gates: [technically_correct]
---

# Grading the agentic-evaluation exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the judge parses the verdict and
   range-checks the score before trusting it; the suite runs the agent then judges each case and computes
   pass_rate as the fraction passed; the gate compares pass_rate against the threshold with `>=`. No
   conceptually wrong step.
2. `computes_metrics` — the solution derives the right quantities from the data (pass_rate as fraction
   passed, avg_score as the mean, the failed inputs; a validated score in [0,1]) rather than a superficial
   or hard-coded stand-in.
3. `handles_edge_cases` — boundaries and bad input are handled: an out-of-range score raises `ValueError`,
   an on-the-bar run passes the gate (`>=`), the empty/all-fail suite does not crash.
4. `matches_intent` — the code does what the prompt asked (validated verdict dict, pass_rate/avg_score/failed
   report, boolean gate) rather than a superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "computes_metrics": true, "handles_edge_cases": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
