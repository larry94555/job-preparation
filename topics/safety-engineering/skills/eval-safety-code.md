---
id: eval-safety-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [blocks_untrusted_high_risk]
---

# Grading the authorization exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `blocks_untrusted_high_risk` — blocks when the tool is high-risk AND provenance is "untrusted" AND
   not confirmed (the confused-deputy case).
2. `allows_trusted_high_risk` — a trusted high-risk action is allowed (the user asked for it).
3. `allows_untrusted_low_risk` — an untrusted low-risk action is allowed (reading is harmless).
4. `confirmation_overrides` — independent confirmation lets an otherwise-blocked action through.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `blocks_untrusted_high_risk` is a gate: failing to block it is the injection vulnerability, so
  missing it caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "blocks_untrusted_high_risk": true, "allows_trusted_high_risk": true, "allows_untrusted_low_risk": true, "confirmation_overrides": true }, "feedback": "one specific sentence" }
```
