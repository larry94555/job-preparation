# Expert Surface — agentic-evaluation

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain why you cannot improve what you do not measure, and why eyeballing transcripts does not scale — `lessons/llm-judge.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: LLM-as-judge, rubric, criteria, strict-JSON verdict, eval suite, pass_rate, threshold, deploy gate, regression — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (a single graded example ↔ a suite pass-rate ↔ a gated deploy) — `lessons/eval-suite.md`, `lessons/deploy-gate.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** LLM-as-judge for open-ended output and its biases (Zheng et al., MT-Bench / Chatbot Arena, 2023) — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Rubric-based grading with explicit criteria and strict-JSON verdicts as the reproducible standard — `lessons/rubrics.md`, `questions/mcq.yaml`.
- ✅ **[L4]** Frontier open problems: agentic/task-completion benchmarks, trajectory evaluation, judge reliability at scale — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** The eval suite as an architecture: run agent, judge each case, aggregate to pass_rate and avg_score, report failures — `lessons/eval-suite.md`, `questions/mcq.yaml`.
- ✅ **[L3]** The deploy gate as a mechanical threshold check (`>=`, no bypass) that blocks sub-bar releases — `lessons/deploy-gate.md`, `questions/mcq.yaml`.
- ✅ **[L3]** The four agent metrics (completion, accuracy, hallucination, cost) and why hallucination is tracked separately — `lessons/eval-suite.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose an unmeasurable "seems fine" agent and prescribe an LLM-as-judge with explicit criteria — `lessons/llm-judge.md`, `lessons/rubrics.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Diagnose a metric-that-improved-but-regressed and prescribe tracking the four metrics separately — `lessons/eval-suite.md`, `questions/mcq.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement an LLM-as-judge call with a validated strict-JSON verdict (`judge`) — `exercises/llm-judge`, `questions/code.yaml`.
- ✅ **[L3]** Implement an eval-suite runner reporting pass_rate, avg_score, and failures (`run_suite`) — `exercises/eval-suite`, `questions/code.yaml`.
- ✅ **[L2]** Implement a deploy gate that blocks below the threshold with `>=` (`gate`) — `exercises/deploy-gate`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** LLM-as-judge + rubric + calibration + a CI deploy gate as the practical eval stack, exemplified by this repo's own meta-eval gate — `lessons/llm-judge.md`, `lessons/deploy-gate.md`, `lessons/expert-context.md`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the eval frontier moves (task-completion benchmarks, trajectory eval, judge reliability) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard LLM-as-judge grading and the four metrics + gate, and defend "never deploy below the bar" under questioning — `questions/essay.yaml` (`essay-judge`, `essay-metrics`).

## Coverage summary
18 items · ✅ 18 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (long-horizon trajectory eval, automated judge de-biasing, live-traffic regression detection).

<!-- coverage: items=18 covered=18 partial=0 gap=0 -->
