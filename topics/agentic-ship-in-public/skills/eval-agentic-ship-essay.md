---
id: eval-agentic-ship-essay
applies_to: essay
output_schema: EssayCheckScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
---

# Grading an agentic-ship-in-public essay

Grade the answer against the question's reference key (`reference_points`). Reward correct, specific
reasoning about shipping a real agent — its architecture and a defended design decision, one concrete
break and its fix, and why proof of working agents beats listing "AI" as a skill — **not** length or
eloquence. Answer each check independently as `true`/`false`. Do **not** compute a total; the engine
aggregates the checks.

## Checks (each true/false)

1. `addresses_question` — Does it answer what was asked (not a tangent)?
2. `covers_key_points` — Does it hit the substance of the reference key (allow equivalent wording)?
3. `technically_correct` — Are the claims correct, with **no** false statements (e.g. does not claim a
   skills list outweighs a working agent, or that a bounded loop is unnecessary)?
4. `concrete` — Is it specific (names a real task, a bounded reason–act loop, specific tools, a
   validation boundary or step cap, a README / eval suite / demo, a concrete break-and-fix) rather than
   vague?

## Reference key

The question supplies `reference_points`; treat them as ground truth and accept equivalent correct
statements. A wrong claim (e.g. "a resume skills list is stronger proof than a shipped agent", "an agent
needs no step cap", or "evals and a README are optional for a hiring portfolio") fails
`technically_correct`.

## How the engine scores it

- Each `true` = 1 point. `>= 3` and `technically_correct == true` → **pass**; `2` → **borderline**;
  else **fail**. Unstable/borderline results are re-graded best-of-3, then flagged for human review.

## Output — JSON only

```json
{ "checks": { "addresses_question": true, "covers_key_points": true, "technically_correct": true, "concrete": false }, "feedback": "one specific sentence" }
```
