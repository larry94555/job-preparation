---
id: eval-structured-output-essay
applies_to: essay
output_schema: EssayCheckScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
---

# Grading a structured-output-reliability essay

Grade the answer against the question's reference key (`reference_points`). Reward correct, specific
reasoning — **not** length or eloquence. Answer each check independently as `true`/`false`. Do **not**
compute a total; the engine aggregates the checks into a score and verdict.

## Checks (each true/false)

1. `addresses_question` — Does the answer actually answer what was asked (not a tangent)?
2. `covers_key_points` — Does it hit the substance of the reference key (allow equivalent wording)?
3. `technically_correct` — Are the claims correct, with **no** false statements?
4. `concrete` — Is it specific (names mechanisms/steps) rather than vague hand-waving?

## Reference key

The question supplies `reference_points`; treat them as ground truth. Accept equivalent correct
statements — do not require exact wording. A wrong claim fails `technically_correct` even if other
points are covered.

## How the engine scores it

- Each `true` = 1 point (max 4).
- `>= 3` **and** `technically_correct == true` → **pass**; exactly `2` → **borderline**; else **fail**.
- On run-to-run disagreement or a borderline total, the engine re-grades best-of-3 and, if still
  unstable, flags for human review.

## Output — JSON only

```json
{
  "checks": { "addresses_question": true, "covers_key_points": true, "technically_correct": true, "concrete": false },
  "feedback": "one specific sentence naming the single most important gap"
}
```
