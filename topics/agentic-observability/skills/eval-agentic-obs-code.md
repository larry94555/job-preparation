---
id: eval-agentic-obs-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
grader_samples: 3
gates: [technically_correct]
---

# Grading the agentic-observability exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the trace accumulates per-step totals
   and a step count; the aggregator sums cost/latency and tallies steps per tool; the alert compares each
   total against its budget with a strict `>` and returns a list. No conceptually wrong step.
2. `aggregates_correctly` — totals and counts are accumulated over the steps (summed/tallied) rather than
   fabricated, hard-coded, or computed from the wrong field.
3. `handles_edge_cases` — the boundaries the exercise calls out are respected: a None/"none" tool is
   excluded from the tool list/tally, an empty input yields zero totals, and a value equal to its budget
   does not alert.
4. `matches_intent` — the code does what the prompt asked (the exact dict shape / list contents /
   ordering) rather than a superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "aggregates_correctly": true, "handles_edge_cases": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
