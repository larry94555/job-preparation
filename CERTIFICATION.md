# Certification rigor (WS4)

The course makes three *different* certification claims. WS4 makes each of them **measured**, not asserted.

| Claim | Question | Mechanism | Where |
|---|---|---|---|
| **Content coverage** | Is the material for the whole Expert Surface actually there? | Enumerated per-topic Expert Surface + weighted coverage | `topics/*/expert-surface.md`, `npm run mastery`, [MASTERY_INDEX.md](MASTERY_INDEX.md) |
| **Eval-skill certification** | Can a grader reproduce its own labels well enough to grade real users? | Meta-eval gate (leave-one-out agreement vs a calibration set) | `npm run eval-gate`, this doc |
| **Learner certification** | Has *this* user demonstrated the competency at its target level? | Mastery bands + spaced repetition in the runner | `packages/lesson`, `app/server.ts` |

## 1. Calibration coverage — now 100%

The meta-eval gate can only measure a skill that ships a **calibration set** (labelled example answers with
expected verdicts). Before WS4 one skill was unmeasurable: `golang-concurrency/eval-code-worker-pool` had no
calibration. WS4 added `topics/golang-concurrency/calibration/eval-code-worker-pool.yaml`, so **every eval-skill
in the repo (essay + code, ~2 per topic) now has a calibration set** and is measurable. `npm run validate`
confirms each topic reports equal skill and calibration-set counts.

## 2. The meta-eval gate

`npm run eval-gate` (= `tsx packages/evaluator/src/cli.ts meta-eval topics --threshold 0.7`) grades every
calibration case with the local model, **excluding that case from its own few-shot** (no leakage), and reports
per-skill agreement with the expected verdict. A skill at or above the threshold is *passing*; below it is
*needs-work* and "not cleared to grade real users." The command **exits non-zero if any skill is below
threshold**, and **self-skips (exit 0) when no grading model is reachable** — so it is safe in CI and blocking
locally. It is wired into:

- `npm run certify` — the full local gate: `validate && selfcheck && typecheck && test && eval-gate`.
- `.github/workflows/ci.yml` — runs validate/selfcheck/typecheck/test on every push (eval-gate self-skips in
  CI where no model is present; run it locally against a model to actually certify the skills).

Point it at a model with `LLAMA_BASE_URL` / `LLAMA_MODEL`, e.g. Ollama:

```
LLAMA_BASE_URL=http://localhost:11434/v1 LLAMA_MODEL=llama3:8b npm run eval-gate
```

## 3. Live results — full sweep (2026-07-09)

The complete sweep ran against **Ollama `llama3:8b`** (the pinned production grader is Qwen2.5-3B-Instruct via
`llama-server`; 8B is what this machine had). Headline: **46 skills measured, 19 passing, 27 below the 0.7
threshold → the gate exits non-zero.** The split by skill type:

| Skill type | Passing (≥70%) | Needs-work (<70%) | Notes |
|---|---|---|---|
| **Essay** | 16 / 23 | 7 (all at 50%) | Most decomposed essay rubrics reproduce their labels; 7 sit one case short. |
| **Code concept** | 3 / 23 | 20 (33–67%) | Only the sharpest three (`safety`, `specdec`, `structured-output`) hit 100%; the rest under-reproduce. |
| **Total** | **19 / 46** | **27 / 46** | |

Below-threshold code skills cluster at **33%** (adaptation, guardrails, batching, cost, funccall, harness,
kv-cache, prefill, caching, quant, retrieval-evals) and **67%** (context, eval-methodology, tradeoffs,
observability, routing, isolation, failure-modes, rag). Below-threshold essays are all at **50%** (batching,
cost, eval-methodology, funccall, prefill, retrieval-evals, golang).

**This is the gate doing its job, not a regression** — it refuses to certify skills a small general model
can't reproduce, rather than rubber-stamping them. Read correctly, it says two things:

1. **The judge matters.** These rubrics were written for the pinned **Qwen2.5-3B** (and, in production, with
   confidence escalation on top). A general `llama3:8b` is a *lower bound*; the three code skills that still
   hit 100% show the rubric design is sound where the calibration cases are sharp. Re-run on Qwen2.5-3B before
   drawing conclusions: `LLAMA_MODEL=<qwen> npm run eval-gate`.
2. **The weak calibration sets need tightening** — more cases and sharper near-binary check wording, especially
   the code sets stuck at 33%. That is concrete, prioritizable follow-up work the gate now surfaces per skill.

Full per-skill output is reproducible any time with `npm run eval-gate` (≈ minutes/skill on a local 8B).

## What "certified" does and does not mean here

A *passing* eval-skill means the grader reproduces its own labels — a necessary floor, not proof of perfect
grading. Real deployment adds confidence escalation (best-of-3 → larger model → human review, DESIGN §7) on top
of this gate. Content coverage (MASTERY_INDEX.md) and learner mastery (the runner) are tracked separately, so
"the topic's material is complete," "the grader is trustworthy," and "the learner is expert" never get conflated.
