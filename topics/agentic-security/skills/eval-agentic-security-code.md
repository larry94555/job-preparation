---
id: eval-agentic-security-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [technically_correct]
---

# Grading the agentic-security exercises (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code works.
Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `technically_correct` — the approach is sound for the exercise: the sanitizer matches the injection
   patterns case-insensitively and replaces them with the marker; the redactor replaces emails and
   secret-like tokens while leaving ordinary words alone; the output filter blocks the disallowed tools
   and allows the rest. No conceptually wrong step.
2. `separates_or_sanitizes` — the solution actually neutralizes the threat it targets (scrubs injection
   patterns, redacts PII, or blocks the disallowed action) rather than passing untrusted input through
   untouched.
3. `handles_edge_cases` — benign input is left unchanged and the intended adversarial input is caught
   (case-insensitive match, an allowed tool passes, a short word is not redacted), instead of over- or
   under-matching.
4. `matches_intent` — the code does what the prompt asked (the right marker/reason strings, the right
   tools blocked, emails and keys both handled) rather than a superficially similar thing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `technically_correct` is a gate: if it is false the verdict is capped one level down.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "technically_correct": true, "separates_or_sanitizes": true, "handles_edge_cases": true, "matches_intent": true }, "feedback": "one specific sentence" }
```
