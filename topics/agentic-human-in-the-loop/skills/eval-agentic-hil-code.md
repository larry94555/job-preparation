---
id: eval-agentic-hil-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
grader_samples: 3
gates: [technically_correct]
---

# Grading the agentic-human-in-the-loop exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: risk is classified so irreversible/
   expensive actions are high; the approval gate blocks `execute` on a rejected high-risk action and
   runs low/medium directly; the audit log appends in order and filters by action. No conceptually wrong
   step.
2. `gates_high_risk` — high-risk (irreversible/expensive) actions are the ones held behind approval, and
   a rejected high-risk action does not execute; low/medium actions are not needlessly gated.
3. `audits_actions` — decisions are recorded to an audit trail (action, params, risk, decision) rather
   than left untracked, and the log is appended to, not overwritten.
4. `matches_intent` — the code does what the prompt asked (correct risk levels, execute-only-on-approval,
   query filters by action) rather than a superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "gates_high_risk": true, "audits_actions": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
