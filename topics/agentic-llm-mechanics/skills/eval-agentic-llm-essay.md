---
id: eval-agentic-llm-essay
applies_to: essay
output_schema: EssayCheckScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
---

# Grading an agentic-llm-mechanics essay

Grade the answer against the question's reference key (`reference_points`). Reward correct, specific
reasoning about context windows and token budgets, routing tasks to the cheapest capable tier, cost per
run, and the model's failure modes (hallucination, lost-in-the-middle, instruction drift, latency) —
**not** length or eloquence. Answer each check independently as `true`/`false`. Do **not** compute a
total; the engine aggregates the checks.

## Checks (each true/false)

1. `addresses_question` — Does it answer what was asked (not a tangent)?
2. `covers_key_points` — Does it hit the substance of the reference key (allow equivalent wording)?
3. `technically_correct` — Are the claims correct, with **no** false statements?
4. `concrete` — Is it specific (names mechanisms — context window, token budget, cheap/balanced/best
   tiers, per-token cost, grounding, re-asserting instructions, U-shaped lost-in-the-middle) rather than
   vague?

## Reference key

The question supplies `reference_points`; treat them as ground truth and accept equivalent correct
statements. A wrong claim (e.g. "the cheapest model is always the most accurate", "a bigger context
window makes retrieval uniformly reliable", or "hallucination is fixed by lowering temperature to zero")
fails `technically_correct`.

## How the engine scores it

- Each `true` = 1 point. `>= 3` and `technically_correct == true` → **pass**; `2` → **borderline**;
  else **fail**. Unstable/borderline results are re-graded best-of-3, then flagged for human review.

## Output — JSON only

```json
{ "checks": { "addresses_question": true, "covers_key_points": true, "technically_correct": true, "concrete": false }, "feedback": "one specific sentence" }
```
