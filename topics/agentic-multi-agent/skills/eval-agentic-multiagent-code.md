---
id: eval-agentic-multiagent-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [technically_correct]
---

# Grading the multi-agent-orchestration exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the supervisor researches then writes
   and loops up to `max_revisions`, returning on approval and returning the last content otherwise; the
   handoff validator rejects empty output with a structured error and passes a non-empty value; the
   approval loop returns on approval and is bounded by `max_tries`. No conceptually wrong step.
2. `handles_loop_exit` — any revision/approval loop has a bounded exit (a `max_revisions`/`max_tries`
   cap) and returns gracefully when it is hit, rather than being able to loop forever.
3. `validates_handoff` — output is checked at the boundary (empty handoff rejected, critic approval
   respected) before it is trusted, rather than passed along blindly.
4. `matches_intent` — the code does what the prompt asked (coordinated the specialists, returned the
   right structured result, respected the critic's approval) rather than a superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "handles_loop_exit": true, "validates_handoff": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
