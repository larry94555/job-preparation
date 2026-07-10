---
id: eval-funccall-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [idempotency_dedupe]
---

# Grading the tool-dispatcher exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `idempotency_dedupe` — a repeated **mutating** call with the same key returns the cached prior
   result and does **not** re-run the handler.
2. `validates_before_execute` — checks the validator (and tool existence) **before** running the handler.
3. `rejects_unknown_tool` — an unknown tool returns a structured error rather than throwing.
4. `read_only_not_deduped` — non-mutating tools aren't cached/deduped by key (idempotency only applies to mutations).

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `idempotency_dedupe` is a gate: without it a retried mutation double-applies the effect, so missing
  it caps the verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "idempotency_dedupe": true, "validates_before_execute": true, "rejects_unknown_tool": true, "read_only_not_deduped": true }, "feedback": "one specific sentence" }
```
