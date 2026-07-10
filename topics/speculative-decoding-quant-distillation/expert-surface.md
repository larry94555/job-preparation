# Expert Surface — speculative-decoding-quant-distillation

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain draft → verify → accept and why speculative decoding is *lossless* — `lessons/specdec.md`, `questions/mcq.yaml`, `questions/build.yaml`.
- ✅ **[L3]** Command the vocabulary: draft/target, acceptance rate, prefix, lossless vs lossy, teacher/student — `lessons/levers.md`, `questions/missing-term.yaml`, `questions/free-entry.yaml`.
- ✅ **[L3]** Match each of the three levers to its goal — latency / memory-cost / smaller model — `lessons/levers.md`, `questions/mcq.yaml`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** Speculative decoding origin: Leviathan et al. (Google) and Chen et al. (DeepMind), 2023 — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Self-speculative heads (Medusa, Cai et al. 2024; EAGLE) that fold the drafter into the target — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Knowledge distillation traces to Hinton et al. (2015) — teacher → student — `lessons/expert-context.md`, `lessons/levers.md`.
- 🟡 **[L4]** Combining levers without quality loss / high acceptance across domains as live open problems — named in `lessons/deep-dive.md` and `lessons/expert-context.md`; no dedicated frontier drill.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The three levers as a tradeoff table (buys / costs / when to reach for it) — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern ladder, including the distill → quantize → speculate stack order — `lessons/deep-dive.md`.
- ✅ **[L4]** Review an inference-optimization design and rate it toy/prototype/demo/production — `lessons/deep-dive.md` checklist, `questions/deep-dive.yaml` (code-review MCs + L4 essay).
- ✅ **[L3]** Speedup is acceptance-bound, not draft-speed-bound, and acceptance is domain-dependent — `lessons/specdec.md`, `lessons/deep-dive.md`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose the goal (latency vs memory/cost vs size) then pick the matching lever — `lessons/when-wrong.md`, `questions/essay.yaml`.
- ✅ **[L3]** Spot the wrong-lever antipatterns: speculative-for-memory, quantize-to-"fix"-latency, distill-volatile-facts — `lessons/when-wrong.md`, `questions/deep-dive.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement `acceptedTokens` — count leading matches, stop at first reject, +1 bonus token — `exercises/accepted-tokens`, `questions/code.yaml`.
- ✅ **[L2]** Reason through accepted-token edge cases (fully-rejected draft → 1, empty draft → 1) — `lessons/build-accepted-tokens.md`, `questions/build.yaml`.
- 🟡 **[L4]** Implement a draft/verify loop or self-speculative head end-to-end — draft/verify explained in `lessons/specdec.md`; only the acceptance-count kernel is a coding exercise.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** vLLM / TensorRT-LLM speculative support and Medusa/EAGLE implementations as the serving stacks — `lessons/expert-context.md`.
- 🟡 **[L3]** Operational judgment on gating every lossy stage behind a task eval between stacked levers — argued in `lessons/deep-dive.md`; not drilled as an ops/metrics exercise.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Track where the frontier moves (high acceptance across domains, joint latency/cost/quality stacking) — pointers in `lessons/expert-context.md` and a curated `reading-list.md` module (WS5).

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags: name the lever, name what it costs, name which is lossless — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Defend a lever-choice / stacking design under interview questioning — `questions/deep-dive.yaml` L4 essay, `questions/expert.yaml` interview essay.

## Coverage summary
19 items · ✅ 16 covered · 🟡 3 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) ≈ **92%**.
Open frontier work: a combining-levers-without-quality-loss drill, an end-to-end draft/verify (or self-speculative
head) coding exercise, an eval-gate/ops metrics drill, and a speculative-decoding reading-list module (WS5).

<!-- coverage: items=19 covered=16 partial=3 gap=0 -->
