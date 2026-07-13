---
id: eval-agentic-memory-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [technically_correct]
---

# Grading the agentic-memory-state exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the buffer caps at capacity and
   evicts the oldest message (FIFO); compression fires only over the token budget, summarizes the
   oldest messages, keeps the recent ones, and stays under budget; recall ranks stored items by
   query relevance rather than insertion order. No conceptually wrong step.
2. `validates_input` — the solution checks its inputs (capacity/`k` positive, message shape, budget)
   before acting on them, rather than trusting them blindly.
3. `handles_errors` — bad input produces a raised error or a correct edge-case result as the exercise
   requires, instead of crashing unexpectedly or silently corrupting state.
4. `matches_intent` — the code does what the prompt asked (evicts the oldest, compresses only when
   over budget while keeping recent messages, ranks recall by relevance and takes top-k) rather than a
   superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "validates_input": true, "handles_errors": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
