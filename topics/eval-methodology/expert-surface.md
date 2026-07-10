# Expert Surface — eval-methodology

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain why evals — not prompt tweaks — are the core discipline: quality becomes a repeatable, versioned number — `lessons/golden-and-regression.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: golden set, regression gate, adversarial suite, LLM-as-judge, calibration, held-out — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Translate between altitudes (rubric ↔ true/false checks; "looks better" ↔ a gated pass rate) — `lessons/llm-as-judge.md`, `lessons/build-eval-gate.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** LLM-as-judge, MT-Bench, and Chatbot Arena (Zheng et al., LMSYS 2023), incl. documented judge biases — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** HELM (Liang et al., Stanford CRFM 2022) as the holistic-benchmark reference — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Practitioner canon: Hamel Husain, Eugene Yan on looking at data and calibrating judges — `lessons/expert-context.md`.
- 🟡 **[L4]** Open frontier — trustworthy cheap judges, contamination, benchmark construct validity — named in `lessons/expert-context.md`; no dedicated frontier drill.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five eval levers (scoring method, dataset composition, gate placement, judge calibration, freshness) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for an eval design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review an eval design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Judge cost scales with dataset × runs; push work onto free deterministic checks — `lessons/deep-dive.md`, `questions/deep-dive.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a golden set that passes at 95% but breaks in production → add adversarial coverage — `lessons/adversarial.md`, `questions/essay.yaml`.
- ✅ **[L3]** Diagnose an uncalibrated judge gating a build → measure judge-vs-human agreement first — `lessons/llm-as-judge.md`, `questions/deep-dive.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement an eval gate: run → compare → aggregate pass rate, gate on threshold, report failing names — `exercises/eval-gate`, `questions/code.yaml`.
- ✅ **[L4]** Debug a broken gate (pass rate over passed-only denominator → always green) — `exercises/eval-gate-debug`, `questions/deep-dive.yaml`.
- 🟡 **[L4]** Implement a calibrated LLM-as-judge with rubric decomposition and κ agreement — taught in `lessons/llm-as-judge.md`; no dedicated coding exercise.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** promptfoo / OpenAI Evals / LangSmith / Braintrust / Inspect as the eval stacks — `lessons/expert-context.md`.
- 🟡 **[L3]** Operational freshness loop (canary → feed production failures back → de-dup) — described in `lessons/deep-dive.md`, `lessons/adversarial.md`; not drilled as an operational metric.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the eval frontier moves (judge calibration, eval-set drift/contamination) and how to track it — `reading-list.md` (curated papers/tools + a staying-current method), pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags on evals (when LLM-as-judge is appropriate; vibes/teaching-to-the-test) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend an eval strategy under questioning (golden set + gate → adversarial → calibrated judge) — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
18 items · ✅ 15 covered · 🟡 3 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) ≈ **92%**.
Open frontier work: a judge-calibration coding exercise, an eval-set drift/contamination drill,
and an operational freshness-metric drill.

<!-- coverage: items=18 covered=15 partial=3 gap=0 -->
