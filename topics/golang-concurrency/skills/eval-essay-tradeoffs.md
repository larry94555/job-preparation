---
id: eval-essay-tradeoffs
applies_to: essay
output_schema: TradeoffScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
---

# Grading a trade-off essay

Grade the answer against the reference key. Reward correct, specific reasoning — **not**
eloquence or length. Answer each check independently as `true`/`false`. Do **not** compute a
total; the engine aggregates the checks into a score and verdict.

## Checks (each true/false)

1. `both_sides` — Does the answer say when option A is appropriate **and** when option B is?
2. `real_tradeoff` — Does it name a real, concrete trade-off (e.g. contention, overhead,
   deadlock risk, readability)?
3. `correct` — Are all technical claims correct, with no wrong statements?
4. `specific` — Is it concrete rather than hand-wavy?

## Reference key

The question supplies `reference_points`. Treat them as the ground truth the answer is measured
against. Do not require the exact wording — accept equivalent correct statements.

## How the engine scores it

- Each `true` check = 1 point (max 4).
- `>= 3` and `correct == true` → **pass**; `2` → **borderline**; else **fail**.
- If checks disagree across runs, or the total sits on the pass/fail boundary, the engine
  re-grades best-of-3 and, if still unstable, flags the answer for human review.

## Output — JSON only

```json
{
  "checks": { "both_sides": true, "real_tradeoff": true, "correct": true, "specific": false },
  "feedback": "one specific sentence naming the single most important gap"
}
```
