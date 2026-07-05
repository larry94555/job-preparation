---
id: eval-code-worker-pool
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
---

# Grading the worker-pool exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the
code works. Your job is only the design/concept verdict, using the extracted evidence the
engine gives you (test result + static signals for `must_use` / `avoid_antipattern`).

You are given:

- `tests_passed`: boolean.
- `signals.must_use`: which required constructs were detected (`goroutine`, `channel`,
  `sync.WaitGroup`).
- `signals.avoid_antipattern`: which antipatterns were detected (`unbounded goroutine spawn`,
  `busy-wait loop`).

## Checks (each true/false)

1. `bounded_concurrency` — Exactly `workers` goroutines, not one-per-job (no unbounded spawn).
2. `uses_primitives` — Uses channels **and** a WaitGroup (or equivalent) to coordinate.
3. `no_busywait` — No busy-wait / spin loop for synchronization.
4. `order_preserved` — Results are placed back in input order (by index), not append-as-done.

## How the engine scores it

- Concept score only applies when `tests_passed == true`; otherwise the attempt fails on
  correctness regardless of concepts.
- `>= 3` checks true → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{
  "checks": {
    "bounded_concurrency": true,
    "uses_primitives": true,
    "no_busywait": true,
    "order_preserved": true
  },
  "feedback": "one specific sentence"
}
```
