---
id: eval-agentic-deploy-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
grader_samples: 3
gates: [technically_correct]
---

# Grading the agentic-deployment exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the job queue stores a queued job on
   submit and only runs the worker in `run_next`, marking done/failed correctly without letting the
   worker exception escape; the token bucket refills from the injected `now`, caps at capacity, and
   consumes a token to allow; the router uses a stable (unsalted) hash and honours the 0/100 boundaries.
   No conceptually wrong step.
2. `correct_behavior` — the solution produces the required behavior on the core cases (a submitted job
   is queued then done/failed; a burst allows then denies then refills; 0→stable, 100→canary) rather
   than a superficially similar approximation.
3. `handles_edge_cases` — it handles the boundaries the exercise names (empty queue is a no-op, a
   failing worker becomes a failed job not a crash, refill capped at capacity, canary_pct 0 and 100)
   instead of ignoring them.
4. `matches_intent` — the code does what the prompt asked (never runs the worker inside submit, injects
   the clock rather than reading it, uses a stable hash rather than `hash()`) rather than a look-alike.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "correct_behavior": true, "handles_edge_cases": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
