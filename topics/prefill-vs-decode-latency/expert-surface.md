# Expert Surface — prefill-vs-decode-latency

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain the two phases: prefill is parallel/compute-bound, decode is sequential/memory-bandwidth-bound — `lessons/phases.md`, `questions/free-entry.yaml`.
- ✅ **[L3]** Command the vocabulary: prefill, decode, TTFT, TPOT/ITL, chunked prefill, disaggregation — `lessons/metrics.md`, `questions/missing-term.yaml`, `questions/free-entry.yaml`.
- ✅ **[L3]** Explain why "one latency number" is wrong — a change touches one phase, not both — `lessons/phases.md`, `lessons/deep-dive.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** Chunked prefill / Sarathi (Agrawal et al., MSR) as the interleaving origin — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Prefill/decode disaggregation — DistServe & Splitwise (2024) — `lessons/expert-context.md`, `questions/expert.yaml`.
- 🟡 **[L4]** SLO-optimal P/D scheduling as an open problem — named in `lessons/expert-context.md`; no dedicated frontier drill.
- ⬜ **[L4]** Cross-phase interference on shared hardware as active research — mentioned as an open problem in `lessons/expert-context.md`; not yet drilled or modeled.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The prefill/decode levers (single vs. separate SLOs, monolithic vs. chunked prefill, disaggregation, batching) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a serving design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a P/D design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Why batching amortizes bandwidth (decode) not compute (prefill) — `lessons/batching.md`, `questions/free-entry.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose whether a slow request is prefill-bound (TTFT) or decode-bound (TPOT) from workload shape — `lessons/metrics.md`, `questions/deep-dive.yaml`.
- ✅ **[L3]** Pick the phase-correct lever and reject the wrong-phase fix (decode batching for a prefill-bound miss) — `lessons/deep-dive.md`, `questions/deep-dive.yaml`.

## D5 — Engineering & code craft
- ✅ **[L2]** Implement a phase-aware latency model (`total = TTFT + outputTokens × tpot`, phases kept separate) — `exercises/latency-model`, `questions/code.yaml`.
- 🟡 **[L4]** Implement chunked-prefill scheduling / a P/D disaggregation interface — taught conceptually in `lessons/batching.md`, `lessons/deep-dive.md`; no dedicated coding exercise.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** vLLM / TensorRT-LLM as the serving stacks, GenAI-Perf for benchmarking the two SLOs — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- 🟡 **[L3]** Operational signals (per-phase p95 TTFT/TPOT, prefill stall on decode under load) — discussed in `lessons/deep-dive.md`; not drilled as metrics/alerts.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the P/D frontier moves (SLO-optimal scheduling, phase interference) and how to track it — `reading-list.md` (curated sources + staying-current section), pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags on prefill/decode (name the phase before the fix; avoid one latency number) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a phase-aware serving design under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
18 items · ✅ 15 covered · 🟡 2 partial · ⬜ 1 gap. Weighted coverage (covered=1, partial=0.5) ≈ **89%**.
Open frontier work: a SLO-optimal P/D scheduling drill, a phase-interference model/exercise, a
chunked-prefill / disaggregation coding exercise, and a per-phase operational-metrics drill.

<!-- coverage: items=18 covered=15 partial=2 gap=1 -->
