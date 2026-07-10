# Expert Surface — adaptation-strategy-selection

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain the four levers and what each *changes* (ICL/RAG = prompt, fine-tuning = weights, distillation = deployed model) — `lessons/approaches.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: RAG, PEFT/LoRA, distillation (teacher/student), in-context learning, freshness, attribution — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** State the knowledge-vs-behavior distinction as a one-line mental model — `lessons/approaches.md`, `lessons/deep-dive.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** RAG (Lewis et al., 2020) as the origin of query-time retrieval without weight change — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** LoRA/PEFT (Hu et al., Microsoft, 2021) as the canonical parameter-efficient fine-tuning method — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** Knowledge distillation (Hinton et al., 2015) as teacher→student behavior copying — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L4]** Continual / online adaptation as data drifts, principled RAG+PEFT+distill combination, and when-to-fine-tune-vs-prompt/RAG as an open decision problem — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The four-lever tradeoff table (buys/costs/reach-for-it-when) across freshness, cost, latency, attribution — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern ladder for an adaptation design (lightest-first vs. hybrid vs. fine-tune-volatile-facts) — `lessons/deep-dive.md`.
- ✅ **[L4]** Review an adaptation design and rate it toy/prototype/demo/production via the 5-point checklist — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Hybrids multiply the eval surface (RAG + PEFT = two places quality regresses) — `lessons/deep-dive.md`.

## D4 — Problem solving
- ✅ **[L3]** Map a scenario's needs (freshness / behavior / attribution / cost / latency) to the right lever by precedence — `lessons/decision-axes.md`, `questions/build.yaml`.
- ✅ **[L3]** Diagnose the wrong tool in a proposal and reassign it (volatile facts → RAG, formatting → fine-tune) — `lessons/antipatterns.md`, `questions/deep-dive.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement `chooseStrategy(req)` with correct precedence (freshness/attribution → rag first) — `exercises/choose-strategy`, `questions/code.yaml`.
- ✅ **[L3]** Encode the antipattern fix in code: never pick fine-tuning for a fresh-facts requirement — `lessons/build-choose-strategy.md`, `exercises/choose-strategy/solution.test.ts`.
- 🟡 **[L4]** Build a real RAG-vs-PEFT hybrid pipeline with per-lever eval gates — described in `lessons/deep-dive.md`; no coding exercise beyond the decision function.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** PEFT/LoRA libraries, RAG frameworks, distillation tooling, and open-vs-frontier model choice — `lessons/expert-context.md`.
- ✅ **[L3]** Operating adaptation in production (per-strategy quality/cost/latency tracking, staleness of fine-tuned knowledge, retrieval freshness/TTL, re-train cadence signals) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Track where the adaptation frontier moves (principled selection, method combination, continual adaptation) — pointers in `lessons/expert-context.md`; curated reading-list & staying-current module in `reading-list.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags: name the *wrong* tool (fine-tuning for volatile facts), defend a combination — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Walk an interviewer through the decision axes and defend a sequenced/hybrid strategy under questioning — `questions/deep-dive.yaml` design-review essay, `questions/essay.yaml` interview essay.

## Coverage summary
20 items · ✅ 19 covered · 🟡 1 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) ≈ **98%**.
Remaining open work: a real RAG+PEFT hybrid coding exercise with per-lever eval gates (D5). The
continual/online-adaptation frontier drill and the hybrid ops-metrics operational drill are now covered
by `lessons/frontier-ops.md` + `questions/frontier-ops.yaml`.

<!-- coverage: items=20 covered=19 partial=1 gap=0 -->
