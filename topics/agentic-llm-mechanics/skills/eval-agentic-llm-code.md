---
id: eval-agentic-llm-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [technically_correct]
---

# Grading the agentic-llm-mechanics exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the router maps simple tasks to the
   cheap tier, hard tasks to the best tier, and defaults an unknown task to balanced; the cost estimator
   prices input and output tokens separately per 1000 and rounds to 6 dp; the budget fitter keeps a
   leading system message and the most-recent messages that fit, dropping the oldest non-system first. No
   conceptually wrong step.
2. `correct_logic` — the core computation is right: tier mapping and default, the per-1k cost arithmetic,
   or the newest-first keep / oldest-first drop with original-order output.
3. `handles_edge_cases` — the solution handles the stated edges (unknown task defaults instead of raising;
   zero tokens returns 0.0; no system message, or everything fitting under budget) rather than crashing or
   mishandling them.
4. `matches_intent` — the code does what the prompt asked (returns the tier string, the rounded dollar
   figure, or the kept messages in original order) rather than a superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "correct_logic": true, "handles_edge_cases": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
