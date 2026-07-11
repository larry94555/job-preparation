# Harness engineering — verification & control

## Verification is the harness's job

The model can *claim* it edited a file, fixed a bug, or ran a command — but a claim is not a fact.
**Don't trust; check.** After a mutating action the harness verifies the real world: run the tests,
read the `git diff`, run the code, type-check, or re-read the changed file.

Self-verification by the model is unreliable: the same reasoning that produced an error tends to
miss it on review. So verification is a *harness* responsibility, done with deterministic checks,
not a prompt asking the model "are you sure?".

## Bounding and controlling the loop

Control is what keeps autonomy safe:

- **Budgets & termination conditions** — step/tool/token/time caps and explicit "done" signals.
- **Idempotency** — make mutating tools safe to retry, so a repeated call has no extra effect.
- **Plan-then-execute** — separate planning from doing so each step can be verified and, if needed,
  re-planned independently.
- **Know when *not* to add agents** — a single bounded loop with good tools usually beats a swarm of
  agents; more agents means more coordination failure, not automatically more capability.

Put together, the boundary (§1), the loop (§2), and verification/control (here) are what turn a
capable model into a *reliable* feature.
