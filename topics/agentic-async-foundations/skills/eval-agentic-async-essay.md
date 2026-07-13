---
id: eval-agentic-async-essay
applies_to: essay
output_schema: EssayCheckScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
grader_samples: 3
---

# Grading an agentic-async-foundations essay

Grade the answer against the question's reference key (`reference_points`). Reward correct, specific
reasoning about async concurrency (I/O-bound work, the event loop, fan-out with gather) and resilience
(timeouts, retries with backoff and jitter, error isolation) — **not** length or eloquence. Answer each
check independently as `true`/`false`. Do **not** compute a total; the engine aggregates the checks.

## Checks (each true/false)

1. `addresses_question` — Does it answer what was asked (not a tangent)?
2. `covers_key_points` — Does it hit the substance of the reference key (allow equivalent wording)?
3. `technically_correct` — Are the claims correct, with **no** false statements?
4. `concrete` — Is it specific (names mechanisms — I/O-bound, event loop, await, asyncio.gather,
   timeout/wait_for, exponential backoff, jitter, return_exceptions — or gives a concrete speedup/example)
   rather than vague?

## Reference key

The question supplies `reference_points`; treat them as ground truth and accept equivalent correct
statements. A wrong claim (e.g. "async runs the calls on parallel CPU cores", "gather makes each call
faster", "retrying forever is fine", or "gather isolates failures by default") fails
`technically_correct`.

## How the engine scores it

- Each `true` = 1 point. `>= 3` and `technically_correct == true` → **pass**; `2` → **borderline**;
  else **fail**. Unstable/borderline results are re-graded best-of-3, then flagged for human review.

## Output — JSON only

```json
{ "checks": { "addresses_question": true, "covers_key_points": true, "technically_correct": true, "concrete": false }, "feedback": "one specific sentence" }
```
