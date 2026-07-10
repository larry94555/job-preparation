---
id: eval-isolation-code
applies_to: code
output_schema: CodeConceptScore
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
gates: [key_includes_tenant]
---

# Grading the tenant-cache exercise (concepts only)

Functional correctness is already decided by the test run — **do not** re-judge whether the code
works. Judge only the design/concepts from the evidence (`tests_passed` + the code text).

## Checks (each true/false)

1. `key_includes_tenant` — the internal storage key is scoped by the tenant (e.g. `tenant + sep + key`),
   so identical keys from different tenants can't collide.
2. `no_cross_tenant_leak` — `get` for a different tenant under the same key returns null, never the
   other tenant's value.
3. `same_tenant_hit` — `get` returns the value stored by the same tenant under that key.
4. `miss_returns_null` — a missing (tenant, key) returns null rather than undefined/throwing.

## How the engine scores it

- Concept checks apply only when `tests_passed == true`; otherwise the attempt fails on correctness.
- `key_includes_tenant` is a gate: keying without the tenant is the leak, so missing it caps the
  verdict below pass.
- `>= 3` checks true (with the gate) → **pass**; `2` → **borderline**; else **fail**.

## Output — JSON only

```json
{ "checks": { "key_includes_tenant": true, "no_cross_tenant_leak": true, "same_tenant_hit": true, "miss_returns_null": true }, "feedback": "one specific sentence" }
```
