---
id: eval-agentic-obs-essay
applies_to: essay
output_schema: EssayCheckScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
grader_samples: 3
---

# Grading an agentic-observability essay

Grade the answer against the question's reference key (`reference_points`). Reward correct, specific
reasoning about tracing, spans, the production metrics (cost, latency, failure rate), and how dashboards
and alerts catch them — **not** length or eloquence. Answer each check independently as `true`/`false`.
Do **not** compute a total; the engine aggregates the checks.

## Checks (each true/false)

1. `addresses_question` — Does it answer what was asked (not a tangent)?
2. `covers_key_points` — Does it hit the substance of the reference key (allow equivalent wording)?
3. `technically_correct` — Are the claims correct, with **no** false statements?
4. `concrete` — Is it specific (names mechanisms — trace / span, trace_id, per-step cost/latency/error,
   tail p95/p99, dashboards vs. alerts, budgets/SLOs) rather than vague?

## Reference key

The question supplies `reference_points`; treat them as ground truth and accept equivalent correct
statements. A wrong claim (e.g. "a run-level total is enough to find a slow step", "cost surprises come
from the provider raising per-token prices", or "alerts and dashboards are the same thing") fails
`technically_correct`.

## How the engine scores it

- Each `true` = 1 point. `>= 3` and `technically_correct == true` → **pass**; `2` → **borderline**;
  else **fail**. Unstable/borderline results are re-graded best-of-3, then flagged for human review.

## Output — JSON only

```json
{ "checks": { "addresses_question": true, "covers_key_points": true, "technically_correct": true, "concrete": false }, "feedback": "one specific sentence" }
```
