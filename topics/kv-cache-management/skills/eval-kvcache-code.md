---
id: eval-kvcache-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [null_when_insufficient]
---

# Grading the paged-allocator exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `null_when_insufficient` — `allocate` returns `null` (and leaves the pool unchanged) when the
   requested block count exceeds the free blocks; it never over-allocates past capacity.
2. `ceil_blocks` — computes `ceil(numTokens / blockSize)` blocks (rounds up).
3. `no_overlap` — blocks are removed from the free pool on allocate, so two live allocations can't
   share a block.
4. `free_returns` — `free` puts the blocks back so they can be reused.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `null_when_insufficient` is a gate: over-allocating past capacity is the OOM failure, so missing it
  caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "null_when_insufficient": true, "ceil_blocks": true, "no_overlap": true, "free_returns": true }, "feedback": "one specific sentence" }
```
