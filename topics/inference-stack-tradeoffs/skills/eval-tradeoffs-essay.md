---
id: eval-tradeoffs-essay
applies_to: essay
output_schema: EssayCheckScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
# Routed to a stronger judge with best-of-N voting: the pinned 3B
# non-deterministically flags `technically_correct` on clean, correct
# serving-tradeoff answers (diagnosed across 3 calibration rewrites, 25%→50%→60%,
# never ≥0.7). llama3:8b grades this rubric far better but still has residual
# run-to-run noise (60–80% single-sample), so we vote best-of-3 — the same
# self-consistency production uses (DESIGN §7.4) — which stabilizes it at 80%.
grader_model: "llama3:8b"
grader_samples: 3
---

# Grading an inference-stack-tradeoffs essay

Grade the answer against the question's reference key (`reference_points`). Reward correct, specific
reasoning about the four-way tradeoff — latency, quality, cost, and reliability — the dominant axis of
each serving lever (batching, quantization, caching, fallback, speculative decoding), and SLO-anchored
budget decomposition. Reward the reasoning, **not** length or eloquence. Answer each check
independently as `true`/`false`. Do **not** compute a total; the engine aggregates the checks.

## Checks (each true/false)

1. `addresses_question` — Does it answer what was asked (not a tangent)?
2. `covers_key_points` — Does it hit the substance of the reference key (allow equivalent wording)?
3. `technically_correct` — Are the claims correct, with **no** false statements (e.g. does not claim
   batching lowers latency, that quantization is a free win with no quality risk, or that reliability
   costs nothing)?
4. `concrete` — Is it specific (names real mechanisms — throughput/tail latency, INT8/INT4 precision,
   cache hit/staleness, redundancy cost, p99, TTFT, SLO, per-stage budget) rather than vague?

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
