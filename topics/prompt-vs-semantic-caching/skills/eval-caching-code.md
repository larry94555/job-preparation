---
id: eval-caching-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [threshold_gate]
---

# Grading the semantic-cache exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `threshold_gate` — returns a value only when the best match's similarity is **>= threshold**;
   a below-threshold near-miss is a miss (this prevents false positives).
2. `cosine_similarity` — uses cosine (normalized dot product), not a raw dot product or Euclidean distance.
3. `ttl_expiry` — treats entries older than `ttlMs` as misses (does not serve stale entries).
4. `nearest_entry` — compares against stored entries and picks the most similar, rather than the first near one.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `threshold_gate` is a gate: skipping it (returning near-misses) caps the verdict below pass because
  it's the false-positive risk that makes semantic caching dangerous.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "threshold_gate": true, "cosine_similarity": true, "ttl_expiry": true, "nearest_entry": true }, "feedback": "one specific sentence" }
```
