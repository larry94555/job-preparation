---
id: eval-guardrails-essay
applies_to: essay
output_schema: EssayCheckScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
---

# Grading an agent-guardrails-and-budgets essay

Grade the answer against the question's reference key (`reference_points`). Reward correct, specific
reasoning about keeping autonomous agents bounded and safe — termination conditions, progress/loop
detection, budgets (steps/tools/tokens/cost/wall-clock), and guardrails (allow-lists, human-in-the-loop
confirmation, circuit breakers) — **not** length or eloquence. Answer each check independently as
`true`/`false`. Do **not** compute a total; the engine aggregates the checks.

## Checks (each true/false)

1. `addresses_question` — Does it answer what was asked (not a tangent)?
2. `covers_key_points` — Does it hit the substance of the reference key (allow equivalent wording)?
3. `technically_correct` — Are the claims correct, with **no** false statements (e.g. does not claim a
   success-only exit is sufficient, that a deny-list is safer than an allow-list, or that a step budget
   already bounds wall-clock time)?
4. `concrete` — Is it specific (names real mechanisms — step/tool/token/cost/wall-clock budgets, loop or
   no-progress detection, allow-list, HITL confirmation, circuit breaker, graceful partial-result
   termination) rather than vague?

## Reference key

The question supplies `reference_points`; treat them as ground truth and accept equivalent correct
statements. A wrong claim fails `technically_correct`.

## How the engine scores it

- Each `true` = 1 point. `>= 3` and `technically_correct == true` → **pass**; `2` → **borderline**;
  else **fail**. Unstable/borderline results are re-graded best-of-3, then flagged for human review.

## Output — JSON only

```json
{ "checks": { "addresses_question": true, "covers_key_points": true, "technically_correct": true, "concrete": false }, "feedback": "one specific sentence" }
```
