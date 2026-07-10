---
id: eval-cost-essay
applies_to: essay
output_schema: EssayCheckScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
---

# Grading a cost-attribution essay

Grade the answer against the question's reference key (`reference_points`). Reward correct, specific
reasoning about attributing LLM spend — cost drivers, attribution dimensions and tag propagation,
unit economics (cost per successful task), and hidden costs (retries, abandonment, over-retrieval) —
**not** length or eloquence. Answer each check independently as `true`/`false`. Do **not** compute a
total; the engine aggregates the checks.

## Checks (each true/false)

1. `addresses_question` — Does it answer what was asked (not a tangent)?
2. `covers_key_points` — Does it hit the substance of the reference key (allow equivalent wording)?
3. `technically_correct` — Are the claims correct, with **no** false statements (e.g. does not claim
   per-model cost is the right granularity, or that retries are free, or that over-retrieval lowers cost)?
4. `concrete` — Is it specific (names real mechanisms — attribution tags, tag propagation, feature/
   tenant/journey, cost per successful task, marginal vs. blended cost, retries, over-retrieval)
   rather than vague?

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
