---
id: eval-prefill-essay
applies_to: essay
output_schema: EssayCheckScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
---

# Grading a prefill-vs-decode-latency essay

Grade the answer against the question's reference key (`reference_points`). Reward correct, specific
reasoning about the two inference phases — prefill vs. decode, compute-bound vs. memory-bandwidth-bound,
TTFT vs. TPOT, and why batching, prompt length, and output length affect each phase — **not** length or
eloquence. Answer each check independently as `true`/`false`. Do **not** compute a total; the engine
aggregates the checks.

## Checks (each true/false)

1. `addresses_question` — Does it answer what was asked (not a tangent)?
2. `covers_key_points` — Does it hit the substance of the reference key (allow equivalent wording)?
3. `technically_correct` — Are the claims correct, with **no** false statements (e.g. does not claim
   decode is compute-bound, that prefill is sequential, that TTFT is set by decode, or that batching
   speeds up prefill)?
4. `concrete` — Is it specific (names real mechanisms — prefill/decode, compute-bound,
   memory-bandwidth-bound, TTFT, TPOT, KV cache, batching, chunked prefill) rather than vague?

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
