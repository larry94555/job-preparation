---
id: eval-agentic-async-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [technically_correct]
grader_samples: 3
---

# Grading the agentic-async-foundations exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the fan-out schedules the calls
   concurrently (asyncio.gather) and preserves order; the retry awaits fn, catches the exception, retries
   with exponential backoff up to the cap via the injected sleep, and re-raises on exhaustion; the
   isolator runs all coroutines concurrently and wraps each as ok/value or ok/error. No conceptually
   wrong step.
2. `concurrent_not_sequential` — the solution actually overlaps the calls (gather over coroutine objects,
   or equivalent) rather than awaiting each one in a sequential loop that defeats the fan-out.
3. `handles_failures` — failures are handled as the exercise requires: retries with a bounded cap and
   backoff, or per-item isolation so one raising coroutine does not sink the batch — instead of crashing
   or retrying forever.
4. `matches_intent` — the code does what the prompt asked (order preserved, injected sleep used,
   exception re-raised on exhaustion, results shaped as ok/value or ok/error) rather than a superficially
   similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "concurrent_not_sequential": true, "handles_failures": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
